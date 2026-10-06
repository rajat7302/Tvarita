import crypto from 'crypto';
import { randomUUID } from 'crypto';
import Booking from '../models/Booking.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import Show from '../models/Show.js';
import { razorpayDispatcher } from '../utils/razorpayNetwork.js';

const HOLD_MINUTES = 15;

const credentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const error = new Error('Razorpay test keys are not configured on the backend.');
    error.statusCode = 503;
    throw error;
  }
  return { keyId, keySecret };
};

const razorpayRequest = async (path, method = 'GET', body) => {
  const { keyId, keySecret } = credentials();
  let response;
  try {
    response = await fetch(`https://api.razorpay.com/v1${path}`, {
      method,
      dispatcher: razorpayDispatcher,
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch (cause) {
    const error = new Error('Cannot reach Razorpay from the backend. Check the server network and DNS configuration.');
    error.statusCode = 502;
    error.cause = cause;
    throw error;
  }
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error?.description || 'Razorpay request failed.');
    error.statusCode = response.status >= 500 ? 502 : response.status;
    throw error;
  }
  return result;
};

const reserveTickets = (showId, count) => Show.findOneAndUpdate(
  { _id: showId, date: { $gt: new Date() }, availableTickets: { $gte: count } },
  [{ $set: {
    availableTickets: { $subtract: ['$availableTickets', count] },
    isSoldOut: { $lte: [{ $subtract: ['$availableTickets', count] }, 0] }
  } }],
  { new: true }
);

const restoreReservation = async (showId, count) => {
  if (!showId || !count) return;
  await Show.updateOne({ _id: showId }, {
    $inc: { availableTickets: count },
    $set: { isSoldOut: false }
  });
};

export const releaseExpiredOrders = async () => {
  const expired = await PaymentTransaction.find({ status: 'created', expiresAt: { $lte: new Date() } }).limit(100);
  for (const transaction of expired) {
    const claimed = await PaymentTransaction.findOneAndUpdate(
      { _id: transaction._id, status: 'created' },
      { $set: { status: 'expired' } },
      { new: true }
    );
    if (claimed?.purpose === 'ticket') await restoreReservation(claimed.showId, claimed.ticketsCount);
  }
};

export const createPaymentOrder = async (req, res) => {
  let heldShowId = null;
  let heldTicketCount = 0;
  try {
    await releaseExpiredOrders();
    const purpose = String(req.body.purpose || '');
    if (purpose !== 'ticket' && purpose !== 'donation') {
      return res.status(400).json({ message: 'Payment purpose must be ticket or donation.' });
    }

    let show = null;
    let ticketsCount = 0;
    let amountPaise;

    if (purpose === 'ticket') {
      ticketsCount = Number(req.body.ticketsCount || 1);
      if (!Number.isInteger(ticketsCount) || ticketsCount < 1 || ticketsCount > 10) {
        return res.status(400).json({ message: 'Choose between 1 and 10 tickets.' });
      }
      show = await Show.findById(req.body.showId);
      if (!show) return res.status(404).json({ message: 'Show not found.' });
      amountPaise = Math.round(Number(show.ticketPrice || 0) * ticketsCount * 100);
      if (!Number.isFinite(amountPaise) || amountPaise < 0) {
        return res.status(400).json({ message: 'Ticket price is invalid.' });
      }

      if (amountPaise === 0) {
        const reserved = await reserveTickets(show._id, ticketsCount);
        if (!reserved) return res.status(409).json({ message: 'Tickets are sold out or this show has started.' });
        const booking = await Booking.create({
          showId: show._id,
          userId: req.user._id,
          ticketsBooked: ticketsCount,
          totalPaid: 0,
          paymentStatus: 'completed',
          ticketCode: `TVR-${randomUUID().replace(/-/g, '').slice(0, 18).toUpperCase()}`
        });
        return res.status(201).json({ freeBooking: booking });
      }

      const reserved = await reserveTickets(show._id, ticketsCount);
      if (!reserved) return res.status(409).json({ message: 'Tickets are sold out or this show has started.' });
      heldShowId = show._id;
      heldTicketCount = ticketsCount;
    } else {
      const amount = Number(req.body.amount);
      if (!Number.isInteger(amount) || amount < 1 || amount > 1000000) {
        return res.status(400).json({ message: 'Donation must be between ₹1 and ₹10,00,000.' });
      }
      amountPaise = amount * 100;
      if (req.body.showId) {
        show = await Show.findById(req.body.showId);
        if (!show) return res.status(404).json({ message: 'Show not found.' });
      }
    }

    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
    const order = await razorpayRequest('/orders', 'POST', {
      amount: amountPaise,
      currency: 'INR',
      receipt: `tvarita_${Date.now()}_${randomUUID().slice(0, 8)}`,
      notes: {
        userId: String(req.user._id),
        purpose,
        showId: show ? String(show._id) : '',
        ticketsCount: String(ticketsCount)
      }
    });

    await PaymentTransaction.create({
      orderId: order.id,
      userId: req.user._id,
      purpose,
      showId: show?._id || null,
      ticketsCount,
      amountPaise,
      expiresAt
    });

    res.status(201).json({
      keyId: credentials().keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      purpose,
      ticketsCount,
      showTitle: show?.title || ''
    });
  } catch (error) {
    if (heldShowId) await restoreReservation(heldShowId, heldTicketCount).catch(() => {});
    console.error('Create payment order failed:', error.message, error.cause?.cause?.code || error.cause?.code || '');
    res.status(error.statusCode || 500).json({ message: error.message || 'Could not start payment.' });
  }
};

export const cancelPaymentOrder = async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findOneAndUpdate(
      { orderId: req.params.orderId, userId: req.user._id, status: 'created' },
      { $set: { status: 'failed' } },
      { new: true }
    );
    if (transaction?.purpose === 'ticket') await restoreReservation(transaction.showId, transaction.ticketsCount);
    res.json({ cancelled: Boolean(transaction) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (!orderId || !paymentId || !signature) return res.status(400).json({ message: 'Incomplete payment verification data.' });

    const transaction = await PaymentTransaction.findOne({ orderId, userId: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Payment order not found.' });
    if (transaction.status === 'completed') {
      const booking = transaction.bookingId ? await Booking.findById(transaction.bookingId).populate('showId', 'title venue date') : null;
      return res.json({ status: 'completed', purpose: transaction.purpose, booking, amount: transaction.amountPaise / 100 });
    }
    const { keySecret } = credentials();
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest();
    const receivedSignature = Buffer.from(signature, 'hex');
    if (expectedSignature.length !== receivedSignature.length || !crypto.timingSafeEqual(expectedSignature, receivedSignature)) {
      return res.status(400).json({ message: 'Payment signature verification failed.' });
    }

    let payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
    if (payment.order_id !== orderId || payment.amount !== transaction.amountPaise || payment.currency !== 'INR') {
      return res.status(400).json({ message: 'Payment details do not match this order.' });
    }
    if (payment.status === 'authorized' && !payment.captured) {
      payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}/capture`, 'POST', {
        amount: transaction.amountPaise,
        currency: 'INR'
      });
    }
    if (payment.status !== 'captured' && !payment.captured) {
      return res.status(402).json({ message: 'Payment is not captured; no ticket was issued.' });
    }

    if (transaction.status === 'refunded') {
      return res.status(409).json({ message: 'This payment was refunded because its ticket reservation expired.' });
    }
    if (!['created', 'verifying'].includes(transaction.status) || transaction.expiresAt <= new Date()) {
      await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}/refund`, 'POST', {
        amount: transaction.amountPaise,
        notes: { reason: 'Ticket reservation expired before payment confirmation.' }
      });
      transaction.paymentId = paymentId;
      transaction.status = 'refunded';
      await transaction.save();
      return res.status(409).json({ message: 'The ticket reservation expired. A refund has been requested.' });
    }

    let booking = null;
    if (transaction.purpose === 'ticket') {
      booking = await Booking.findOne({ paymentId });
      if (!booking) {
        const claim = await PaymentTransaction.findOneAndUpdate(
          { _id: transaction._id, status: 'created' },
          { $set: { status: 'verifying', paymentId } },
          { new: true }
        );
        if (!claim && transaction.status !== 'verifying') {
          return res.status(409).json({ message: 'Payment is already being verified.' });
        }
        booking = await Booking.create({
          showId: transaction.showId,
          userId: transaction.userId,
          ticketsBooked: transaction.ticketsCount,
          totalPaid: transaction.amountPaise / 100,
          paymentId,
          orderId,
          paymentStatus: 'completed',
          ticketCode: `TVR-${randomUUID().replace(/-/g, '').slice(0, 18).toUpperCase()}`
        });
      }
      transaction.bookingId = booking._id;
      await booking.populate('showId', 'title venue date artFormName imageUrl mediaUrl mediaType');
    }

    transaction.paymentId = paymentId;
    transaction.status = 'completed';
    await transaction.save();
    res.status(201).json({ status: 'completed', purpose: transaction.purpose, booking, amount: transaction.amountPaise / 100 });
  } catch (error) {
    console.error('Payment verification failed:', error.message, error.cause?.cause?.code || error.cause?.code || '');
    res.status(error.statusCode || 500).json({ message: error.message || 'Could not verify payment.' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('showId', 'title venue date artFormName imageUrl mediaUrl mediaType')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyTicketAtDoor = async (req, res) => {
  try {
    const ticketCode = String(req.body.ticketCode || '').trim();
    if (!ticketCode) return res.status(400).json({ message: 'Ticket code required.' });
    const booking = await Booking.findOneAndUpdate(
      { ticketCode, paymentStatus: 'completed', ticketStatus: 'valid' },
      { $set: { ticketStatus: 'used' } },
      { new: true }
    ).populate('showId', 'title venue date');
    if (booking) return res.json({ valid: true, booking });

    const existing = await Booking.findOne({ ticketCode }).populate('showId', 'title venue date');
    if (!existing) return res.status(404).json({ valid: false, message: 'Ticket not found.' });
    res.status(409).json({ valid: false, message: `Ticket is ${existing.ticketStatus}.`, booking: existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

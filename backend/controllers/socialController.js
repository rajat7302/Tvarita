import mongoose from 'mongoose';
import FriendRequest from '../models/FriendRequest.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const publicUserFields = 'name bio profilePhotoUrl role isVerifiedArtist artistProfile.teamName';
const validId = (id) => mongoose.isValidObjectId(id);
const sameId = (left, right) => String(left) === String(right);

const isBlocked = async (firstUserId, secondUserId) => {
  const blocker = await User.exists({ _id: firstUserId, blockedUsers: secondUserId });
  const blockedBy = await User.exists({ _id: secondUserId, blockedUsers: firstUserId });
  return Boolean(blocker || blockedBy);
};

const areFriends = async (firstUserId, secondUserId) => {
  const result = await User.exists({ _id: firstUserId, friends: secondUserId });
  return Boolean(result);
};

const userHasConversation = async (conversationId, userId) => {
  if (!validId(conversationId)) return null;
  return Conversation.findOne({ _id: conversationId, members: userId });
};

export const getPublicProfile = async (req, res) => {
  try {
    if (!validId(req.params.userId)) return res.status(400).json({ message: 'Invalid profile ID.' });
    const person = await User.findById(req.params.userId).select(publicUserFields);
    if (!person) return res.status(404).json({ message: 'Profile not found.' });
    const friendship = req.user ? await FriendRequest.findOne({
      $or: [
        { from: req.user._id, to: person._id },
        { from: person._id, to: req.user._id }
      ]
    }).sort({ createdAt: -1 }) : null;
    const blockedByMe = req.user ? Boolean(await User.exists({ _id: req.user._id, blockedUsers: person._id })) : false;
    const blockedMe = req.user ? Boolean(await User.exists({ _id: person._id, blockedUsers: req.user._id })) : false;
    res.json({ user: person, friendshipStatus: friendship?.status || 'none', isSelf: req.user ? sameId(req.user._id, person._id) : false, blockedByMe, blockedMe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchPeople = async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (query.length < 2) return res.json([]);
    const people = await User.find({
      _id: { $ne: req.user._id, $nin: req.user.blockedUsers || [] },
      name: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    }).select(publicUserFields).limit(20);
    res.json(people);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const from = req.user._id;
    const to = req.params.userId;
    if (!validId(to)) return res.status(400).json({ message: 'Invalid user ID.' });
    if (sameId(from, to)) return res.status(400).json({ message: 'You cannot add yourself.' });
    const target = await User.findById(to).select('_id');
    if (!target) return res.status(404).json({ message: 'User not found.' });
    if (await isBlocked(from, to)) return res.status(403).json({ message: 'A block prevents this request.' });
    if (await areFriends(from, to)) return res.status(409).json({ message: 'You are already friends.' });

    const incoming = await FriendRequest.findOne({ from: to, to: from, status: 'pending' });
    if (incoming) {
      incoming.status = 'accepted';
      incoming.respondedAt = new Date();
      await incoming.save();
      await Promise.all([
        User.updateOne({ _id: from }, { $addToSet: { friends: to } }),
        User.updateOne({ _id: to }, { $addToSet: { friends: from } })
      ]);
      return res.status(200).json({ status: 'accepted', request: incoming });
    }

    const existing = await FriendRequest.findOne({ from, to, status: 'pending' });
    if (existing) return res.status(409).json({ message: 'Friend request is already pending.' });
    const request = await FriendRequest.create({ from, to });
    req.app.get('io')?.to(`user:${to}`).emit('friend-request:new', { requestId: request._id, from: req.user.name });
    res.status(201).json({ status: 'pending', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listFriendRequests = async (req, res) => {
  try {
    const [received, sent] = await Promise.all([
      FriendRequest.find({ to: req.user._id, status: 'pending' }).populate('from', publicUserFields).sort({ createdAt: -1 }),
      FriendRequest.find({ from: req.user._id, status: 'pending' }).populate('to', publicUserFields).sort({ createdAt: -1 })
    ]);
    res.json({ received, sent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondFriendRequest = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['accept', 'reject'].includes(action)) return res.status(400).json({ message: 'Choose accept or reject.' });
    const request = await FriendRequest.findOne({ _id: req.params.requestId, to: req.user._id, status: 'pending' });
    if (!request) return res.status(404).json({ message: 'Pending friend request not found.' });
    if (await isBlocked(req.user._id, request.from)) return res.status(403).json({ message: 'This user is blocked.' });

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    request.respondedAt = new Date();
    await request.save();
    if (action === 'accept') {
      await Promise.all([
        User.updateOne({ _id: request.from }, { $addToSet: { friends: request.to } }),
        User.updateOne({ _id: request.to }, { $addToSet: { friends: request.from } })
      ]);
    }
    req.app.get('io')?.to(`user:${request.from}`).emit('friend-request:updated', { requestId: request._id, status: request.status });
    res.json({ request, status: request.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', publicUserFields).select('friends');
    res.json(user?.friends || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const blockedId = req.params.userId;
    if (!validId(blockedId) || sameId(blockedId, req.user._id)) return res.status(400).json({ message: 'Invalid user to block.' });
    const target = await User.findById(blockedId).select('_id');
    if (!target) return res.status(404).json({ message: 'User not found.' });
    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $addToSet: { blockedUsers: blockedId }, $pull: { friends: blockedId } }),
      User.updateOne({ _id: blockedId }, { $pull: { friends: req.user._id } }),
      FriendRequest.updateMany({ status: { $in: ['pending', 'accepted'] }, $or: [{ from: req.user._id, to: blockedId }, { from: blockedId, to: req.user._id }] }, { $set: { status: 'rejected', respondedAt: new Date() } })
    ]);
    res.json({ blocked: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $pull: { blockedUsers: req.params.userId } });
    res.json({ blocked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', publicUserFields).select('blockedUsers');
    res.json(user?.blockedUsers || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ members: req.user._id })
      .populate('members', publicUserFields)
      .populate('admins', 'name')
      .populate({ path: 'lastMessage', populate: { path: 'senderId', select: 'name' } })
      .sort({ lastActivityAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDirectConversation = async (req, res) => {
  try {
    const otherId = req.params.userId;
    if (!validId(otherId) || sameId(otherId, req.user._id)) return res.status(400).json({ message: 'Invalid person.' });
    if (await isBlocked(req.user._id, otherId)) return res.status(403).json({ message: 'This chat is blocked.' });
    if (!(await areFriends(req.user._id, otherId))) return res.status(403).json({ message: 'Add this person as a friend before starting a chat.' });

    let conversation = await Conversation.findOne({ isGroup: false, members: { $all: [req.user._id, otherId] }, $expr: { $eq: [{ $size: '$members' }, 2] } });
    if (!conversation) {
      conversation = await Conversation.create({ members: [req.user._id, otherId], createdBy: req.user._id });
    }
    await conversation.populate('members', publicUserFields);
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroupConversation = async (req, res) => {
  try {
    if (req.file && !req.file.mimetype?.startsWith('image/')) return res.status(415).json({ message: 'Group photo must be an image.' });
    const name = String(req.body.name || '').trim();
    const requestedMembers = Array.isArray(req.body.memberIds)
      ? req.body.memberIds
      : req.body.memberIds
        ? [req.body.memberIds]
        : [];
    const memberIds = [...new Set([String(req.user._id), ...requestedMembers.map(String)])];
    if (!name) return res.status(400).json({ message: 'Group name is required.' });
    if (memberIds.length < 2) return res.status(400).json({ message: 'Choose at least one friend to create a group.' });
    if (memberIds.length > 100 || memberIds.some((id) => !validId(id))) return res.status(400).json({ message: 'Invalid group member list.' });

    const friends = new Set((await User.findById(req.user._id).select('friends')).friends.map(String));
    const notFriends = memberIds.filter((id) => id !== String(req.user._id) && !friends.has(id));
    if (notFriends.length) return res.status(403).json({ message: 'Groups can only include your friends.' });

    const conversation = await Conversation.create({
      isGroup: true,
      name,
      avatarUrl: req.file?.path || '',
      members: memberIds,
      admins: [req.user._id],
      createdBy: req.user._id
    });
    await conversation.populate('members', publicUserFields);
    await conversation.populate('admins', 'name');
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addGroupMembers = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.conversationId, isGroup: true, admins: req.user._id });
    if (!conversation) return res.status(404).json({ message: 'Group not found or admin access required.' });
    const memberIds = Array.isArray(req.body.memberIds) ? req.body.memberIds.map(String) : [];
    const user = await User.findById(req.user._id).select('friends');
    const friendIds = new Set(user.friends.map(String));
    if (memberIds.some((id) => !validId(id) || !friendIds.has(id))) return res.status(403).json({ message: 'Only your friends can be added to this group.' });
    conversation.members.addToSet(...memberIds);
    await conversation.save();
    await conversation.populate('members', publicUserFields);
    await conversation.populate('admins', 'name');
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const conversation = await userHasConversation(req.params.conversationId, req.user._id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
    const messages = await Message.find({ conversationId: conversation._id, deletedFor: { $ne: req.user._id } })
      .populate('senderId', 'name bio')
      .sort({ createdAt: 1 })
      .limit(500);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const conversation = await userHasConversation(req.params.conversationId, req.user._id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
    if (req.file && !req.file.mimetype) return res.status(415).json({ message: 'Unsupported attachment.' });
    if (!conversation.isGroup) {
      const otherId = conversation.members.find((memberId) => !sameId(memberId, req.user._id));
      if (otherId && await isBlocked(req.user._id, otherId)) return res.status(403).json({ message: 'This chat is blocked.' });
    }
    const text = String(req.body.text || '').trim();
    const mediaUrl = req.file?.path || '';
    if (!text && !mediaUrl) return res.status(400).json({ message: 'Write a message or attach media.' });

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      text,
      mediaUrl,
      mediaType: req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('video/') ? 'video' : req.file.mimetype.startsWith('audio/') ? 'audio' : 'document') : '',
      mediaFileName: req.file?.originalname || ''
    });
    conversation.lastMessage = message._id;
    conversation.lastActivityAt = new Date();
    await conversation.save();
    await message.populate('senderId', 'name bio');
    req.app.get('io')?.to(`conversation:${conversation._id}`).emit('message:new', message);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const message = await Message.findOne({ _id: req.params.messageId, conversationId: req.params.conversationId, senderId: req.user._id, deletedForEveryone: false });
    if (!message) return res.status(404).json({ message: 'Your message was not found.' });
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Message cannot be empty.' });
    message.text = text;
    message.editedAt = new Date();
    await message.save();
    req.app.get('io')?.to(`conversation:${message.conversationId}`).emit('message:updated', message);
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const membership = await userHasConversation(req.params.conversationId, req.user._id);
    if (!membership) return res.status(404).json({ message: 'Conversation not found.' });
    const message = await Message.findOne({ _id: req.params.messageId, conversationId: req.params.conversationId });
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    if (req.body.scope === 'everyone') {
      if (!sameId(message.senderId, req.user._id)) return res.status(403).json({ message: 'Only the sender can delete for everyone.' });
      message.deletedForEveryone = true;
      message.text = '';
      message.mediaUrl = '';
      message.mediaFileName = '';
    } else {
      message.deletedFor.addToSet(req.user._id);
    }
    await message.save();
    req.app.get('io')?.to(`conversation:${message.conversationId}`).emit('message:deleted', { messageId: message._id, scope: req.body.scope, userId: req.user._id });
    res.json({ messageId: message._id, scope: req.body.scope || 'me' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forwardMessage = async (req, res) => {
  try {
    const source = await Message.findById(req.params.messageId);
    if (!source || !(await userHasConversation(source.conversationId, req.user._id))) return res.status(404).json({ message: 'Message not found.' });
    const conversationIds = [...new Set((req.body.conversationIds || []).map(String))].slice(0, 10);
    if (!conversationIds.length) return res.status(400).json({ message: 'Select at least one conversation.' });
    const targets = await Conversation.find({ _id: { $in: conversationIds }, members: req.user._id });
    if (targets.length !== conversationIds.length) return res.status(403).json({ message: 'You cannot forward to one or more selected conversations.' });
    for (const target of targets) {
      if (!target.isGroup) {
        const otherMember = target.members.find((member) => !sameId(member, req.user._id));
        if (otherMember && await isBlocked(req.user._id, otherMember)) {
          return res.status(403).json({ message: 'You cannot forward into a blocked conversation.' });
        }
      }
    }
    const forwarded = await Promise.all(targets.map(async (target) => {
      const message = await Message.create({
        conversationId: target._id,
        senderId: req.user._id,
        text: source.deletedForEveryone ? '' : source.text,
        mediaUrl: source.deletedForEveryone ? '' : source.mediaUrl,
        mediaType: source.deletedForEveryone ? '' : source.mediaType,
        mediaFileName: source.deletedForEveryone ? '' : source.mediaFileName,
        forwardedFrom: source._id
      });
      target.lastMessage = message._id;
      target.lastActivityAt = new Date();
      await target.save();
      await message.populate('senderId', 'name bio');
      req.app.get('io')?.to(`conversation:${target._id}`).emit('message:new', message);
      return message;
    }));
    res.status(201).json(forwarded);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

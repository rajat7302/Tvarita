import mongoose from 'mongoose';
import ContentReport from '../models/ContentReport.js';
import CommunityComment from '../models/CommunityComment.js';
import Review from '../models/Review.js';

const targetModels = {
  communityComment: CommunityComment,
  showReview: Review
};

export const createContentReport = async (req, res) => {
  try {
    const Model = targetModels[req.params.targetType];
    if (!Model) return res.status(400).json({ message: 'Unsupported report target.' });
    if (!mongoose.isValidObjectId(req.params.targetId)) return res.status(400).json({ message: 'Invalid comment ID.' });

    const reason = String(req.body.reason || '').trim();
    if (!reason) return res.status(400).json({ message: 'Please include a reason for the report.' });

    const target = await Model.findById(req.params.targetId);
    if (!target) return res.status(404).json({ message: 'Comment not found.' });

    const priorReport = await ContentReport.findOne({
      targetType: req.params.targetType,
      targetId: target._id,
      reporterId: req.user._id,
      status: 'open'
    });
    if (priorReport) return res.status(409).json({ message: 'You have already reported this comment.' });

    const report = await ContentReport.create({
      targetType: req.params.targetType,
      targetId: target._id,
      reporterId: req.user._id,
      reporterName: req.user.name || 'User',
      reason,
      contentExcerpt: String(target.comment || '').slice(0, 1000)
    });

    res.status(201).json({ message: 'Report sent to moderators.', reportId: report._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOpenContentReports = async (req, res) => {
  try {
    const reports = await ContentReport.find({ status: 'open' }).sort({ createdAt: 1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewContentReport = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['hide', 'dismiss'].includes(action)) {
      return res.status(400).json({ message: 'Choose hide or dismiss.' });
    }

    const report = await ContentReport.findOne({ _id: req.params.id, status: 'open' });
    if (!report) return res.status(404).json({ message: 'Open report not found.' });

    if (action === 'hide') {
      const Model = targetModels[report.targetType];
      await Model.findByIdAndUpdate(report.targetId, { moderationStatus: 'hidden' });
      report.status = 'hidden';
    } else {
      report.status = 'dismissed';
    }

    report.reviewedAt = new Date();
    await report.save();
    res.json({ message: action === 'hide' ? 'Comment hidden.' : 'Report dismissed.', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

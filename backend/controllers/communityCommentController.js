import CommunityComment from '../models/CommunityComment.js';

const validTargetTypes = new Set(['post', 'experience']);

const getTargetType = (value) => {
  const targetType = String(value || '').toLowerCase();
  return validTargetTypes.has(targetType) ? targetType : null;
};

export const getCommunityComments = async (req, res) => {
  try {
    const targetType = getTargetType(req.params.targetType);
    if (!targetType) return res.status(400).json({ message: 'Invalid community content type.' });

    const comments = await CommunityComment.find({
      targetType,
      targetId: req.params.targetId
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCommunityComment = async (req, res) => {
  try {
    const targetType = getTargetType(req.params.targetType);
    const comment = String(req.body.comment || '').trim();
    const userId = req.user?._id;

    if (!targetType) return res.status(400).json({ message: 'Invalid community content type.' });
    if (!comment) return res.status(400).json({ message: 'Comment cannot be empty.' });
    if (!userId) return res.status(401).json({ message: 'Authentication required.' });

    const savedComment = await CommunityComment.create({
      targetType,
      targetId: req.params.targetId,
      userId,
      userName: req.user.name || 'Anonymous',
      comment
    });

    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleCommunityLike = async (req, res) => {
  try {
    const { targetType, commentId, replyId } = req.params;
    const normalizedType = getTargetType(targetType);
    const userId = req.user?._id;

    if (!normalizedType) return res.status(400).json({ message: 'Invalid community content type.' });

    const comment = await CommunityComment.findOne({ _id: commentId, targetType: normalizedType });
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const toggle = (likes) => {
      const index = likes.findIndex((id) => String(id) === String(userId));
      if (index === -1) likes.push(userId);
      else likes.splice(index, 1);
    };

    if (!replyId) {
      toggle(comment.likes);
    } else {
      const findReply = (replies) => {
        for (const reply of replies) {
          if (String(reply._id) === String(replyId)) return reply;
          const nested = findReply(reply.replies || []);
          if (nested) return nested;
        }
        return null;
      };

      const reply = findReply(comment.replies || []);
      if (!reply) return res.status(404).json({ message: 'Reply not found.' });
      toggle(reply.likes);
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCommunityReply = async (req, res) => {
  try {
    const { targetType, commentId } = req.params;
    const normalizedType = getTargetType(targetType);
    const text = String(req.body.comment || '').trim();
    const userId = req.user?._id;

    if (!normalizedType) return res.status(400).json({ message: 'Invalid community content type.' });
    if (!text) return res.status(400).json({ message: 'Reply cannot be empty.' });

    const comment = await CommunityComment.findOne({ _id: commentId, targetType: normalizedType });
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const newReply = {
      userId,
      userName: req.user.name || 'Anonymous',
      comment: text,
      likes: [],
      replies: []
    };
    const parentReplyId = req.body.parentReplyId;

    if (!parentReplyId) {
      comment.replies.push(newReply);
    } else {
      const insertReply = (replies) => {
        for (const reply of replies) {
          if (String(reply._id) === String(parentReplyId)) {
            reply.replies.push(newReply);
            return true;
          }
          if (insertReply(reply.replies || [])) return true;
        }
        return false;
      };

      if (!insertReply(comment.replies || [])) {
        return res.status(404).json({ message: 'Parent reply not found.' });
      }
    }

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

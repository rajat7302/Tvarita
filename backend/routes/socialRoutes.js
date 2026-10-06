import express from 'express';
import { mediaUpload } from '../middlewares/mediaUpload.js';
import { protect } from '../middlewares/authMiddleware.js';
import {
  addGroupMembers,
  blockUser,
  createDirectConversation,
  createGroupConversation,
  deleteMessage,
  editMessage,
  forwardMessage,
  getConversationMessages,
  getPublicProfile,
  listBlockedUsers,
  listConversations,
  listFriendRequests,
  listFriends,
  respondFriendRequest,
  searchPeople,
  sendFriendRequest,
  sendMessage,
  unblockUser
} from '../controllers/socialController.js';

const router = express.Router();
router.get('/people/:userId', getPublicProfile);
router.use(protect);

router.get('/people', searchPeople);
router.get('/friends', listFriends);
router.get('/friend-requests', listFriendRequests);
router.post('/friend-requests/:userId', sendFriendRequest);
router.patch('/friend-requests/:requestId', respondFriendRequest);
router.get('/blocked', listBlockedUsers);
router.post('/blocked/:userId', blockUser);
router.delete('/blocked/:userId', unblockUser);

router.get('/conversations', listConversations);
router.post('/conversations/direct/:userId', createDirectConversation);
router.post('/conversations/group', mediaUpload.single('avatar'), createGroupConversation);
router.post('/conversations/:conversationId/members', addGroupMembers);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', mediaUpload.single('media'), sendMessage);
router.patch('/conversations/:conversationId/messages/:messageId', editMessage);
router.delete('/conversations/:conversationId/messages/:messageId', deleteMessage);
router.post('/conversations/:conversationId/messages/:messageId/forward', forwardMessage);

export default router;

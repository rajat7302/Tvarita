import React, { useEffect, useState } from 'react';
import { Flag, Heart, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const idOf = (value) => value?._id || value?.id || value;

function ReplyNode({ reply, targetType, commentId, currentUserId, onChanged }) {
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState('');
  const replyId = idOf(reply);
  const isLiked = reply.likes?.some((like) => String(idOf(like)) === String(currentUserId));
  const isOwner = String(idOf(reply.userId)) === String(currentUserId);

  const submitReply = async () => {
    if (!text.trim()) return;
    try {
      const response = await api.post(`/community-comments/${targetType}/${commentId}/replies`, {
        comment: text,
        parentReplyId: replyId
      });
      onChanged(response.data);
      setText('');
      setShowInput(false);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to save reply.');
    }
  };

  const toggleLike = async () => {
    try {
      const response = await api.put(`/community-comments/${targetType}/${commentId}/replies/${replyId}/like`);
      onChanged(response.data);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to save like.');
    }
  };

  const editReply = async () => {
    const comment = window.prompt('Edit reply:', reply.comment || '');
    if (comment === null || !comment.trim()) return;
    try {
      const response = await api.patch(`/community-comments/${targetType}/${commentId}/replies/${replyId}`, { comment });
      onChanged(response.data);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Could not edit reply.');
    }
  };

  const deleteReply = async () => {
    if (!window.confirm('Delete this reply and its nested replies?')) return;
    try {
      const response = await api.delete(`/community-comments/${targetType}/${commentId}/replies/${replyId}`);
      onChanged(response.data);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Could not delete reply.');
    }
  };

  return (
    <div className="ml-5 mt-3 border-l-2 border-amber-200 pl-3 space-y-2">
      <div className="rounded-xl bg-[#FFFDF9] p-3 border border-amber-100">
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-2">{reply.userId?.profilePhotoUrl && <img src={reply.userId.profilePhotoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />}{reply.userId && <Link to={`/profile/${idOf(reply.userId)}`} className="font-bold text-emerald-800 hover:underline">{reply.userId?.name || reply.userName || 'User'}</Link>}{!reply.userId && <span className="font-bold text-emerald-800">{reply.userName || 'User'}</span>}</div>
          <span className="text-gray-400">{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ''}</span>
        </div>
        <p className="mt-1 text-sm text-gray-800">{reply.comment}</p>
        <div className="mt-2 flex gap-4 text-xs font-semibold text-gray-500">
          <button onClick={toggleLike} className={isLiked ? 'text-rose-600' : 'hover:text-rose-600'}>
            <Heart className={`mr-1 inline h-3.5 w-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />{reply.likes?.length || 0}
          </button>
          {isOwner && <><button onClick={editReply} className="hover:text-amber-900">Edit</button><button onClick={deleteReply} className="hover:text-red-700">Delete</button></>}
          <button onClick={() => setShowInput(!showInput)} className="hover:text-amber-900">Reply</button>
        </div>
      </div>
      {showInput && (
        <div className="flex gap-2">
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a reply..." className="min-w-0 flex-1 rounded-lg border border-amber-200 px-3 py-2 text-xs" />
          <button onClick={submitReply} className="rounded-lg bg-emerald-700 px-3 text-white"><Send className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {(reply.replies || []).map((child) => (
        <ReplyNode key={idOf(child)} reply={child} targetType={targetType} commentId={commentId} currentUserId={currentUserId} onChanged={onChanged} />
      ))}
    </div>
  );
}

export default function CommunityDiscussionModal({ isOpen, onClose, targetType, targetId, title, isGuest, onGuest }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const currentUser = JSON.parse(localStorage.getItem('tvarita_user') || 'null');
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (!isOpen || !targetType || !targetId) return;
    setLoading(true);
    api.get(`/community-comments/${targetType}/${targetId}`)
      .then((response) => setComments(Array.isArray(response.data) ? response.data : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [isOpen, targetType, targetId]);

  if (!isOpen) return null;

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'popular') return (b.likes?.length || 0) - (a.likes?.length || 0);
    const difference = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return sortBy === 'oldest' ? -difference : difference;
  });

  const replaceComment = (updated) => {
    setComments((current) => current.map((item) => idOf(item) === idOf(updated) ? updated : item));
  };

  const editComment = async (comment) => {
    const nextComment = window.prompt('Edit comment:', comment.comment || '');
    if (nextComment === null || !nextComment.trim()) return;
    try {
      const response = await api.patch(`/community-comments/${targetType}/${targetId}/comments/${idOf(comment)}`, { comment: nextComment });
      replaceComment(response.data);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Could not edit comment.');
    }
  };

  const deleteComment = async (comment) => {
    if (!window.confirm('Delete this comment and all its replies?')) return;
    try {
      await api.delete(`/community-comments/${targetType}/${targetId}/comments/${idOf(comment)}`);
      setComments((current) => current.filter((item) => idOf(item) !== idOf(comment)));
    } catch (error) {
      window.alert(error.response?.data?.message || 'Could not delete comment.');
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (isGuest) return onGuest();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post(`/community-comments/${targetType}/${targetId}`, { comment: text });
      setComments((current) => [response.data, ...current]);
      setText('');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to save comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (commentId) => {
    if (isGuest) return onGuest();
    try {
      const response = await api.put(`/community-comments/${targetType}/${commentId}/like`);
      replaceComment(response.data);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to save like.');
    }
  };

  const reportComment = async (commentId) => {
    if (isGuest) return onGuest();
    const reason = window.prompt('Why are you reporting this comment?');
    if (!reason?.trim()) return;
    try {
      await api.post(`/reports/communityComment/${commentId}`, { reason });
      window.alert('Report sent to moderators.');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Could not send report.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/60 p-4">
          <div>
            <h3 className="font-extrabold text-gray-900">Discussion</h3>
            <p className="text-xs text-gray-500">{title}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:text-gray-900"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2 text-xs">
          <MessageCircle className="h-4 w-4 text-amber-800" />
          <span className="mr-auto text-gray-500">{comments.length} comments</span>
          {['newest', 'oldest', 'popular'].map((option) => (
            <button key={option} onClick={() => setSortBy(option)} className={`rounded px-2 py-1 capitalize ${sortBy === option ? 'bg-amber-900 text-white' : 'text-gray-600 hover:bg-amber-50'}`}>{option}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-amber-800" /></div> : sortedComments.length === 0 ? <p className="py-12 text-center text-sm text-gray-400">No comments yet. Start the discussion.</p> : sortedComments.map((comment) => {
            const commentId = idOf(comment);
            const isLiked = comment.likes?.some((like) => String(idOf(like)) === String(currentUserId));
            const isOwner = String(idOf(comment.userId)) === String(currentUserId);
            return (
              <div key={commentId} className="mb-3 rounded-xl border border-amber-100 bg-white p-3">
                <div className="flex justify-between text-xs"><div className="flex items-center gap-2">{comment.userId?.profilePhotoUrl && <img src={comment.userId.profilePhotoUrl} alt="" className="h-7 w-7 rounded-full object-cover" />}{comment.userId ? <Link to={`/profile/${idOf(comment.userId)}`} className="font-bold text-amber-900 hover:underline">{comment.userName || 'User'}</Link> : <span className="font-bold text-amber-900">{comment.userName || 'User'}</span>}</div><span className="text-gray-400">{comment.editedAt ? 'Edited · ' : ''}{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</span></div>
                {comment.userId?.bio && <p className="mt-1 text-[11px] text-gray-500">{comment.userId.bio}</p>}
                <p className="mt-1 text-sm text-gray-800">{comment.comment}</p>
                <div className="mt-2 flex gap-4 text-xs font-semibold text-gray-500">
                  <button onClick={() => toggleLike(commentId)} className={isLiked ? 'text-rose-600' : 'hover:text-rose-600'}><Heart className={`mr-1 inline h-3.5 w-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />{comment.likes?.length || 0} Likes</button>
                  <button onClick={() => reportComment(commentId)} className="flex items-center gap-1 hover:text-red-700"><Flag className="h-3.5 w-3.5" /> Report</button>
                  {isOwner && <><button onClick={() => editComment(comment)} className="hover:text-amber-900">Edit</button><button onClick={() => deleteComment(comment)} className="hover:text-red-700">Delete</button></>}
                </div>
                {(comment.replies || []).map((reply) => <ReplyNode key={idOf(reply)} reply={reply} targetType={targetType} commentId={commentId} currentUserId={currentUserId} onChanged={replaceComment} />)}
              </div>
            );
          })}
        </div>
        <form onSubmit={submitComment} className="flex gap-2 border-t border-amber-100 bg-white p-3">
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder={isGuest ? 'Sign in to join the discussion' : 'Share your thoughts...'} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
          <button disabled={submitting || !text.trim()} className="rounded-xl bg-emerald-700 px-4 text-white disabled:opacity-50"><Send className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}

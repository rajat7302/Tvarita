import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export const ReplyItem = ({ reply, reviewId, onLike, onReplySubmit, currentUserId }) => {
  const [showNestedReply, setShowNestedReply] = useState(false);
  const [nestedText, setNestedText] = useState('');
  const [nestedPhoto, setNestedPhoto] = useState('');

  const replyId = reply._id || reply.id;
  const isLiked = reply.likes?.includes(currentUserId);

  return (
    <div className="pl-9 pt-3 space-y-2 border-l-2 border-amber-100/60 ml-4">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[10px]">
            {(reply.userName || reply.author || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-gray-800">{reply.userName || reply.author || 'User'}</span>
        </div>
        <span className="text-[10px] text-gray-400">
          {reply.createdAt ? new Date(reply.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : (reply.time || '')}
        </span>
      </div>

      {reply.comment && <p className="text-xs text-gray-700 leading-relaxed pl-8">{reply.comment}</p>}

      {(reply.imageUrl || reply.photo) && (
        <div className="pl-8 pt-1">
          <img 
            src={reply.imageUrl || reply.photo} 
            alt="Reply attachment" 
            className="w-full max-h-48 object-cover rounded-lg border border-gray-200" 
          />
        </div>
      )}

      <div className="pl-8 flex items-center gap-4 text-[11px] text-gray-500 font-semibold pt-0.5">
        <button 
          onClick={() => onLike(reviewId, replyId)}
          className={`flex items-center gap-1 transition ${isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
          <span>{reply.likes?.length || 0}</span>
        </button>

        <button 
          onClick={() => setShowNestedReply(!showNestedReply)}
          className="hover:text-amber-900 transition"
        >
          Reply
        </button>
      </div>

      {showNestedReply && (
        <div className="pl-8 pt-2 space-y-2">
          <input
            type="text"
            placeholder="Write a nested reply..."
            value={nestedText}
            onChange={(e) => setNestedText(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-gray-50 border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E65100]"
          />
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={nestedPhoto}
              onChange={(e) => setNestedPhoto(e.target.value)}
              className="flex-1 text-xs px-2.5 py-1 bg-gray-50 border border-amber-200 rounded-lg focus:outline-none"
            />
            <button
              onClick={async () => {
                await onReplySubmit(reviewId, replyId, nestedText, nestedPhoto);
                setNestedText('');
                setNestedPhoto('');
                setShowNestedReply(false);
              }}
              className="px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
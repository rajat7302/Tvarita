import React from 'react';
import { User, Clock, MessageCircle } from 'lucide-react';

export default function StoryCard({ post, onDiscuss }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100">
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-2 font-semibold text-amber-900">
          <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 font-bold text-xs">
            {post.userId?.name ? post.userId.name.charAt(0) : 'U'}
          </div>
          <span>{post.userId?.name || 'Community Contributor'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {formattedDate}
        </div>
      </div>

      <h4 className="font-bold text-gray-900 mb-1">{post.title}</h4>
      <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>

      {post.mediaUrl && post.mediaType === 'video' ? (
        <video src={post.mediaUrl} controls className="mt-3 max-h-48 w-full rounded-xl object-cover" />
      ) : post.mediaUrl && post.mediaType === 'audio' ? (
        <audio src={post.mediaUrl} controls className="mt-3 w-full" />
      ) : (post.mediaUrl || post.imageUrl) && (
        <img 
          src={post.mediaUrl || post.imageUrl} 
          alt="Post attachment" 
          className="mt-3 rounded-xl max-h-48 w-full object-cover" 
        />
      )}

      <button
        onClick={() => onDiscuss?.(post)}
        className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-[#E65100]"
      >
        <MessageCircle className="h-4 w-4" /> Discuss
      </button>
    </div>
  );
}
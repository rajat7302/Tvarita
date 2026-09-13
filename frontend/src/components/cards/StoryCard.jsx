import React from 'react';
import { User, Clock } from 'lucide-react';

export default function StoryCard({ post }) {
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

      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt="Post attachment" 
          className="mt-3 rounded-xl max-h-48 w-full object-cover" 
        />
      )}
    </div>
  );
}
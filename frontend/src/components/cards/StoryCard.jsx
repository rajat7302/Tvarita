import React from 'react';
import { User, Clock, MessageCircle } from 'lucide-react';
import MediaAttachment from '../common/MediaAttachment';
import { Link } from 'react-router-dom';
import ImageLightbox from '../common/ImageLightbox';

export default function StoryCard({ post, onDiscuss }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100">
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-2 font-semibold text-amber-900">
          {post.userId?.profilePhotoUrl ? <ImageLightbox src={post.userId.profilePhotoUrl} alt={`${post.userId.name} profile photo`} className="h-6 w-6 shrink-0 rounded-full" imageClassName="h-full w-full rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 font-bold text-xs">{post.userId?.name ? post.userId.name.charAt(0) : 'U'}</div>}
          {post.userId?._id ? <Link to={`/profile/${post.userId._id}`} className="hover:underline">{post.userId.name || 'Community Contributor'}</Link> : <span>{post.userId?.name || 'Community Contributor'}</span>}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {formattedDate}
        </div>
      </div>
      {post.userId?.bio && <p className="mb-3 pl-8 text-xs text-gray-500">{post.userId.bio}</p>}

      <h4 className="font-bold text-gray-900 mb-1">{post.title}</h4>
      <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>

      <MediaAttachment
        url={post.mediaUrl || post.imageUrl}
        type={post.mediaType || 'image'}
        name={post.mediaFileName}
        className="mt-3 max-h-48"
      />

      <button
        onClick={() => onDiscuss?.(post)}
        className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-[#E65100]"
      >
        <MessageCircle className="h-4 w-4" /> Discuss
      </button>
    </div>
  );
}
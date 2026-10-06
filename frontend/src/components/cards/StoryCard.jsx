import React from 'react';
import { Clock, MessageCircle } from 'lucide-react';
import MediaAttachment from '../common/MediaAttachment';
import { Link } from 'react-router-dom';
import ImageLightbox from '../common/ImageLightbox';

export default function StoryCard({ post, onDiscuss }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const author = post.userId;
  const authorName = author?.name || 'Community Contributor';

  const mediaUrl = post.mediaUrl || post.imageUrl;
  const mediaType = post.mediaType || 'image';
  const isImage = mediaType.startsWith('image');

  return (
    <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100">
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-2 font-semibold text-amber-900">
          {author?.profilePhotoUrl ? (
            <ImageLightbox
              src={author.profilePhotoUrl}
              alt={`${authorName} profile photo`}
              showExpandIcon={false}
              className="h-6 w-6 shrink-0 rounded-full overflow-hidden"
              imageClassName="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 font-bold text-xs">
              {author?.name ? author.name.charAt(0) : 'U'}
            </div>
          )}

          {author?._id ? (
            <Link to={`/profile/${author._id}`} className="hover:underline">
              {authorName}
            </Link>
          ) : (
            <span>{authorName}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {formattedDate}
        </div>
      </div>

      {author?.bio && (
        <p className="mb-3 pl-8 text-xs text-gray-500">{author.bio}</p>
      )}

      <h4 className="font-bold text-gray-900 mb-1">{post.title}</h4>
      <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>

      {mediaUrl && isImage && (
        <ImageLightbox
          src={mediaUrl}
          alt={post.title || 'Post image'}
          className="mt-3 overflow-hidden rounded-xl"
          imageClassName="max-h-48 w-full object-cover"
        />
      )}

      {mediaUrl && !isImage && (
        <MediaAttachment
          url={mediaUrl}
          type={mediaType}
          name={post.mediaFileName}
          className="mt-3 max-h-48"
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
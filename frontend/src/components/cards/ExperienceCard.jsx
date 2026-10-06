import React from 'react';
import { HeartHandshake, MessageCircle } from 'lucide-react';
import MediaAttachment from '../common/MediaAttachment';
import { Link } from 'react-router-dom';
import ImageLightbox from '../common/ImageLightbox';

export default function ExperienceCard({ experience, onDiscuss }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 mb-2">
        {experience.userId?.profilePhotoUrl && <ImageLightbox src={experience.userId.profilePhotoUrl} alt={`${experience.userId.name} profile photo`} className="h-6 w-6 shrink-0 rounded-full" imageClassName="h-full w-full rounded-full object-cover" />}
        <HeartHandshake className="w-4 h-4 text-[#E65100]" />
        <span>Attendee Reflection by {experience.userId?._id ? <Link to={`/profile/${experience.userId._id}`} className="hover:underline">{experience.userId.name}</Link> : experience.userId?.name || 'Anonymous Cultural Observer'}</span>
      </div>
      {experience.userId?.bio && <p className="mb-2 pl-6 text-xs text-gray-500">{experience.userId.bio}</p>}

      <p className="text-sm text-gray-800 italic bg-amber-50/40 p-3.5 rounded-xl border border-amber-100">
        "{experience.content}"
      </p>

      <MediaAttachment
        url={experience.mediaUrl || experience.imageUrl}
        type={experience.mediaType || 'image'}
        name={experience.mediaFileName}
        className="mt-3 h-40"
      />

      <button
        onClick={() => onDiscuss?.(experience)}
        className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-[#E65100]"
      >
        <MessageCircle className="h-4 w-4" /> Discuss
      </button>
    </div>
  );
}
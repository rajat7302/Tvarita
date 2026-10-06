import React from 'react';
import { FileText, ExternalLink, Share2 } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

export default function MediaAttachment({ url, type, name, className = '' }) {
  if (!url) return null;

  const shareMedia = async () => {
    try {
      if (navigator.share) await navigator.share({ title: name || 'Shared media', url });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt('Copy this media link:', url);
    } catch (error) {
      if (error.name !== 'AbortError') window.alert('Could not share this media.');
    }
  };

  if (type === 'video') {
    return <div className={`relative ${className}`}><video src={url} controls preload="metadata" className="max-h-72 w-full rounded-xl object-contain" /><button type="button" onClick={shareMedia} title="Share video" aria-label="Share video" className="absolute right-2 top-2 rounded-lg bg-black/65 p-2 text-white"><Share2 className="h-4 w-4" /></button></div>;
  }

  if (type === 'audio') {
    return <div className={`flex items-center gap-2 ${className}`}><audio src={url} controls preload="metadata" className="min-w-0 flex-1" /><button type="button" onClick={shareMedia} title="Share audio" aria-label="Share audio" className="rounded-lg border border-amber-200 p-2 text-amber-900"><Share2 className="h-4 w-4" /></button></div>;
  }

  if (type === 'document') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <a href={url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 hover:bg-amber-100">
          <FileText className="h-5 w-5 shrink-0 text-[#E65100]" />
          <span className="min-w-0 flex-1 truncate">{name || 'Open attached document'}</span>
          <ExternalLink className="h-4 w-4 shrink-0" />
        </a>
        <button type="button" onClick={shareMedia} title="Share document" aria-label="Share document" className="rounded-lg border border-amber-200 p-2 text-amber-900"><Share2 className="h-4 w-4" /></button>
      </div>
    );
  }

  return <ImageLightbox src={url} alt={name || 'Uploaded attachment'} className={`rounded-xl ${className}`} imageClassName="max-h-72 w-full rounded-xl object-cover" />;
}

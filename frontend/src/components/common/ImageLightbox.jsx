import React, { useEffect, useState } from 'react';
import { Maximize2, Share2, X } from 'lucide-react';

export default function ImageLightbox({ src, alt = 'Image', className = '', imageClassName = '' }) {
  const [open, setOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!src) return null;

  const shareImage = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: alt, url: src });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(src);
        setShareMessage('Image link copied');
        setTimeout(() => setShareMessage(''), 1800);
      } else {
        window.prompt('Copy this image link:', src);
      }
    } catch (error) {
      if (error.name !== 'AbortError') setShareMessage('Could not share image');
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`View ${alt} full screen`} className={`group relative block overflow-hidden ${className}`}>
        <img src={src} alt={alt} loading="lazy" className={`block ${imageClassName}`} />
        <span className="absolute bottom-2 right-2 rounded-lg bg-black/70 p-2 text-white opacity-90 transition group-hover:opacity-100" title="View full screen">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${alt} full screen`} onClick={() => setOpen(false)} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-3 sm:p-8">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close full screen image" className="absolute right-3 top-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6 sm:top-6">
            <X className="h-5 w-5" />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); shareImage(); }} aria-label="Share image" className="absolute right-16 top-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-20 sm:top-6">
            <Share2 className="h-5 w-5" />
          </button>
          {shareMessage && <span className="absolute top-16 right-4 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-900 sm:right-6">{shareMessage}</span>}
          <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
        </div>
      )}
    </>
  );
}

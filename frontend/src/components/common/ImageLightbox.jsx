import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Share2, X } from 'lucide-react';

/**
 * Props:
 *  - src, alt
 *  - className:       classes for the clickable wrapper
 *  - imageClassName:  classes for the <img>
 *  - showExpandIcon:  set to false for small images such as avatars
 */
export default function ImageLightbox({
  src,
  alt = 'Image',
  className = '',
  imageClassName = '',
  showExpandIcon = true,
}) {
  const [open, setOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!src) {
    return null;
  }

  // Stops clicks from reaching a parent <Link> or card.
  // React events also bubble out of portals, so this is needed in the modal too.
  const stopEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const openViewer = (event) => {
    stopEvent(event);
    setOpen(true);
  };

  const closeViewer = (event) => {
    stopEvent(event);
    setOpen(false);
  };

  const shareImage = async (event) => {
    stopEvent(event);

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
      if (error.name !== 'AbortError') {
        setShareMessage('Could not share image');
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openViewer}
        aria-label={`View ${alt} full screen`}
        className={`group relative block overflow-hidden ${className}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`block ${imageClassName}`}
        />

        {showExpandIcon && (
          <span
            className="absolute bottom-2 right-2 rounded-lg bg-black/70 p-2 text-white opacity-90 transition group-hover:opacity-100"
            title="View full screen"
          >
            <Maximize2 className="h-4 w-4" />
          </span>
        )}
      </button>

      {/* Rendered on document.body so no parent card can clip it or capture clicks */}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} full screen`}
            onClick={closeViewer}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-3 sm:p-8"
          >
            <button
              type="button"
              onClick={closeViewer}
              aria-label="Close full screen image"
              className="absolute right-3 top-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={shareImage}
              aria-label="Share image"
              className="absolute right-16 top-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-20 sm:top-6"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {shareMessage && (
              <span className="absolute right-4 top-16 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-900 sm:right-6">
                {shareMessage}
              </span>
            )}

            <img
              src={src}
              alt={alt}
              onClick={stopEvent}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>,
          document.body
        )}
    </>
  );
}
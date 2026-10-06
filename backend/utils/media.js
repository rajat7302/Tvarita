const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/rtf',
  'text/rtf',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]);

const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.rtf', '.txt', '.csv', '.xls', '.xlsx', '.ppt', '.pptx'
]);

export const isSupportedMedia = (file) => {
  const mimeType = String(file.mimetype || '').toLowerCase();
  if (mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
    return true;
  }

  const extension = String(file.originalname || '').match(/\.[^.]+$/)?.[0]?.toLowerCase();
  return DOCUMENT_MIME_TYPES.has(mimeType) || DOCUMENT_EXTENSIONS.has(extension);
};

export const getMediaType = (file) => {
  const mimeType = String(file?.mimetype || '').toLowerCase();
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  const extension = String(file?.originalname || '').match(/\.[^.]+$/)?.[0]?.toLowerCase();
  if (/^\.(png|jpe?g|gif|webp|avif|bmp)$/.test(extension || '')) return 'image';
  if (/^\.(mp4|mov|webm|m4v|avi|mkv)$/.test(extension || '')) return 'video';
  if (/^\.(mp3|wav|ogg|m4a|aac|flac)$/.test(extension || '')) return 'audio';
  return 'document';
};

export const getCloudinaryResourceType = (file) => {
  const mediaType = getMediaType(file);
  if (mediaType === 'image') return 'image';
  if (mediaType === 'document') return 'raw';
  return 'video';
};

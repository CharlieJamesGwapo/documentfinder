const endsWith = (value = '', suffix = '') => value.toLowerCase().split('?')[0].endsWith(suffix);

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'document';

const guessExtensionFromUrl = (url = '') => {
  const clean = url.split('?')[0];
  if (!clean.includes('.')) return '';
  return clean.substring(clean.lastIndexOf('.') + 1).toLowerCase();
};

export const getFormatLabel = (mime = '') => {
  if (!mime) return 'File';
  const normalized = mime.toLowerCase();
  if (normalized.includes('pdf')) return 'PDF';
  if (normalized.includes('officedocument')) return 'DOCX';
  if (normalized.includes('msword')) return 'DOC';
  if (normalized.startsWith('image/')) return 'Image';
  return normalized.toUpperCase().split('/').pop();
};

export const getExtensionFromMime = (mime = '') => {
  if (!mime) return '';
  const normalized = mime.toLowerCase();
  if (normalized.includes('pdf')) return 'pdf';
  if (normalized.includes('officedocument')) return 'docx';
  if (normalized.includes('msword')) return 'doc';
  if (normalized.startsWith('image/')) {
    const ext = normalized.split('/')[1];
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return '';
};

export const formatFileSize = (bytes = 0) => {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** idx;
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
};

export const getAvailableFormats = (doc = {}) => {
  const mime = doc?.fileType?.toLowerCase() || '';
  const url = doc?.fileUrl?.toLowerCase() || '';

  return {
    pdf: mime.includes('pdf') || endsWith(url, '.pdf'),
    docx: mime.includes('officedocument') || endsWith(url, '.docx'),
    doc: mime.includes('msword') || endsWith(url, '.doc'),
    image:
      mime.startsWith('image/') ||
      /\.(png|jpe?g|gif|bmp|webp)$/i.test(url)
  };
};

export const buildFilename = (title = 'document', extension = 'file') => {
  const safeTitle = slugify(title);
  const safeExt = extension.replace(/\.+/, '').toLowerCase();
  return `${safeTitle}.${safeExt || 'file'}`;
};

export const downloadDocumentFile = async ({ doc, preferredExtension } = {}) => {
  if (typeof window === 'undefined') {
    throw new Error('Downloads are not available in this environment');
  }

  if (!doc?.fileUrl) {
    throw new Error('Document is missing a file URL');
  }

  const available = getAvailableFormats(doc);
  const normalizedPref = preferredExtension?.toLowerCase();

  if (normalizedPref && !available[normalizedPref]) {
    throw new Error(`${normalizedPref.toUpperCase()} format is not available for this file`);
  }

  const inferredExtension =
    normalizedPref ||
    getExtensionFromMime(doc.fileType) ||
    guessExtensionFromUrl(doc.fileUrl) ||
    'file';

  const response = await fetch(doc.fileUrl);
  if (!response.ok) {
    throw new Error('Unable to download file right now');
  }

  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = href;
  anchor.download = buildFilename(doc.title, inferredExtension);
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
};

import dayjs from 'dayjs';
import { formatFileSize, getFormatLabel } from '../../utils/documents.js';

const badgeClass = (type) => {
  switch (type?.toLowerCase()) {
    case 'manufacturing':
      return 'bg-primary/10 text-primary border-primary/30';
    case 'quality':
      return 'bg-emerald-400/10 text-emerald-300 border-emerald-300/30';
    default:
      return 'bg-white/5 text-white border-white/10';
  }
};

const getTypeLabel = (type) => {
  if (!type) return 'Instruction';
  const normalized = type.toLowerCase();
  if (normalized === 'manufacturing') return 'Manufacturing';
  if (normalized === 'quality') return 'Quality';
  return type;
};

const DocumentCard = ({ document, onPreview, onDownload }) => {
  const tags = Array.isArray(document.tags) ? document.tags : [];
  const formatLabel = getFormatLabel(document.fileType);
  const fileSize = formatFileSize(document.fileSize);

  const handlePreviewClick = () => {
    onPreview?.(document);
  };

  const handleDownloadClick = () => {
    onDownload?.(document);
  };

  return (
    <article className="group flex flex-col justify-between rounded-lg border border-white/10 bg-[#15161b] p-2.5 shadow-lg shadow-black/40 transition hover:-translate-y-0.5 hover:border-primary/40 active:scale-[0.98] sm:rounded-2xl sm:p-5 touch-manipulation tap-highlight animate-slide-up">
      <div className="space-y-2 sm:space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-2xs uppercase tracking-[0.35em] text-slate-500 sm:gap-3 sm:text-xs">
          <span className="truncate">{document.category}</span>
          <span className="whitespace-nowrap">{dayjs(document.createdAt).format('DD MMM YY')}</span>
        </div>

        <div>
          <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-semibold sm:px-3 sm:py-1 sm:text-xs ${badgeClass(document.documentType)}`}>
            {getTypeLabel(document.documentType)}
          </div>
          <h4 className="mt-1.5 line-clamp-2 font-heading text-base text-white sm:mt-3 sm:text-xl">{document.title}</h4>
          <p className="line-clamp-2 text-2xs text-slate-400 sm:text-sm">{document.description || 'No description provided.'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/5 bg-black/20 p-2.5 text-2xs text-slate-400 sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-xs">
          <div>
            <p className="text-slate-500">Format</p>
            <p className="font-semibold text-white">{formatLabel}</p>
          </div>
          <div>
            <p className="text-slate-500">File size</p>
            <p className="font-semibold text-white">{fileSize}</p>
          </div>
          <div>
            <p className="text-slate-500">Version</p>
            <p className="font-semibold text-white">{document.version}</p>
          </div>
          <div>
            <p className="text-slate-500">Owner</p>
            <p className="truncate font-semibold text-white">{document.author?.name ?? 'Unknown'}</p>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 text-2xs text-slate-400 sm:gap-2 sm:text-xs">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 touch-manipulation tap-highlight">#{tag}</span>
            ))}
            {tags.length > 3 && <span className="rounded-full bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 touch-manipulation tap-highlight">+{tags.length - 3}</span>}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300 sm:mt-6 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-2xs uppercase tracking-[0.3em] text-slate-500 sm:text-xs">Updated</p>
          <p className="text-xs font-semibold text-white sm:text-sm">{dayjs(document.updatedAt).format('DD MMM YY')}</p>
        </div>
        <div className="flex gap-2 sm:flex-row sm:gap-2">
          <button
            type="button"
            onClick={handlePreviewClick}
            className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 active:scale-95 sm:flex-initial sm:rounded-full sm:px-4 sm:text-xs touch-manipulation tap-highlight"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleDownloadClick}
            className="flex-1 rounded-lg border border-primary/50 px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-white active:scale-95 sm:flex-initial sm:rounded-full sm:px-4 sm:text-xs touch-manipulation tap-highlight"
          >
            Download
          </button>
        </div>
      </div>
    </article>
  );
};

export default DocumentCard;

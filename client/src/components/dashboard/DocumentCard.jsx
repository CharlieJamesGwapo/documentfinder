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
    <article className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#15161b] p-5 shadow-lg shadow-black/40 transition hover:-translate-y-0.5 hover:border-primary/40">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-slate-500">
          <span>{document.category}</span>
          <span>{dayjs(document.createdAt).format('DD MMM YYYY')}</span>
        </div>

        <div>
          <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(document.documentType)}`}>
            {getTypeLabel(document.documentType)}
          </div>
          <h4 className="mt-3 font-heading text-xl text-white">{document.title}</h4>
          <p className="text-sm text-slate-400">{document.description || 'No description provided.'}</p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 text-xs text-slate-400 sm:grid-cols-2">
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
            <p className="font-semibold text-white">{document.author?.name ?? 'Unknown'}</p>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-3 py-1">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="uppercase tracking-[0.3em] text-slate-500">Updated</p>
          <p className="font-semibold text-white">{dayjs(document.updatedAt).format('DD MMM YYYY')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePreviewClick}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleDownloadClick}
            className="rounded-full border border-primary/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-white"
          >
            Download
          </button>
        </div>
      </div>
    </article>
  );
};

export default DocumentCard;

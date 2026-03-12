import dayjs from 'dayjs';
import { Download, Eye, Pencil, Trash2, Star } from 'lucide-react';
import { formatFileSize, getFormatLabel } from '../../utils/documents.js';
import { getDocumentTypeConfig } from '../../constants/documentTypes.js';

const DocumentCard = ({ document, onPreview, onDownload, onEdit, onDelete, onToggleFavorite, isFavorite }) => {
  const tags = Array.isArray(document.tags) ? document.tags : [];
  const formatLabel = getFormatLabel(document.fileType);
  const fileSize = formatFileSize(document.fileSize);
  const typeConfig = getDocumentTypeConfig(document.documentType);

  return (
    <article className="group flex flex-col justify-between rounded-lg border border-white/10 bg-[#15161b] p-2.5 shadow-lg shadow-black/40 transition hover:-translate-y-0.5 hover:border-primary/40 active:scale-[0.98] sm:rounded-2xl sm:p-5 touch-manipulation tap-highlight animate-slide-up">
      <div className="space-y-2 sm:space-y-4">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-2xs uppercase tracking-[0.35em] text-slate-500 sm:gap-3 sm:text-xs">
            <span className="truncate">{document.category}</span>
            <span className="whitespace-nowrap">{dayjs(document.createdAt).format('DD MMM YY')}</span>
          </div>
          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(document.id)}
                className={`rounded-lg p-1.5 transition active:scale-90 touch-manipulation ${
                  isFavorite
                    ? 'text-amber-400'
                    : 'text-slate-500 hover:text-amber-400'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className="h-3.5 w-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
          {/* Edit/Delete actions - Admin Only */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(document)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-400 active:scale-90 touch-manipulation"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(document)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 active:scale-90 touch-manipulation"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          </div>
        </div>

        <div>
          {typeConfig && (
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-semibold sm:px-3 sm:py-1 sm:text-xs ${typeConfig.color.bg} ${typeConfig.color.text} ${typeConfig.color.border} transition-all ${typeConfig.color.hoverBg}`}>
              <span className="text-sm sm:text-base">{typeConfig.icon}</span>
              <span>{typeConfig.code}</span>
              <span className="hidden sm:inline">- {typeConfig.name}</span>
            </div>
          )}
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
            onClick={() => onPreview?.(document)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2.5 min-h-[44px] text-2xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 active:scale-95 sm:flex-initial sm:rounded-full sm:px-4 sm:min-h-0 sm:py-2 sm:text-xs touch-manipulation tap-highlight"
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => onDownload?.(document)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-primary/50 px-3 py-2.5 min-h-[44px] text-2xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-white active:scale-95 sm:flex-initial sm:rounded-full sm:px-4 sm:min-h-0 sm:py-2 sm:text-xs touch-manipulation tap-highlight"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default DocumentCard;

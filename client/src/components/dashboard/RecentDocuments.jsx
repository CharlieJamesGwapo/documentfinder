import dayjs from 'dayjs';
import { Download, Eye, Pencil, Trash2 } from 'lucide-react';
import { getDocumentTypeConfig } from '../../constants/documentTypes.js';

const RecentDocuments = ({ documents = [], onPreview, onDownload, onEdit, onDelete }) => (
  <section className="rounded-lg border border-white/5 bg-[#15161b] p-3 shadow-lg shadow-black/40 sm:rounded-2xl sm:p-6">
    <div className="mb-3 flex items-center justify-between sm:mb-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Recent</p>
        <h3 className="font-heading text-lg text-white sm:text-xl lg:text-2xl">Latest uploads</h3>
      </div>
      {documents.length > 0 && (
        <span className="text-2xs text-slate-500 sm:text-xs">{documents.length} recent</span>
      )}
    </div>

    {documents.length === 0 ? (
      <p className="py-4 text-xs text-slate-500 sm:py-6 sm:text-sm">No recent documents yet.</p>
    ) : (
      <ul className="space-y-2 sm:space-y-3">
        {documents.map((doc) => {
          const typeConfig = getDocumentTypeConfig(doc.documentType);
          return (
            <li
              key={doc.id}
              className="group flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.03] p-3 text-xs text-slate-300 transition hover:bg-white/[0.06] hover:border-white/10 sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-sm lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0 flex-1 flex items-start gap-3">
                {/* Type badge */}
                {typeConfig && (
                  <span className={`mt-0.5 shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-semibold ${typeConfig.color.bg} ${typeConfig.color.text} ${typeConfig.color.border}`}>
                    <span>{typeConfig.icon}</span>
                    <span>{typeConfig.code}</span>
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{doc.title}</p>
                  <p className="text-2xs uppercase tracking-[0.3em] text-slate-500 sm:text-xs">
                    {doc.category}
                    {doc.author?.name && <span> · {doc.author.name}</span>}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs text-slate-500 sm:gap-2 lg:flex-row lg:items-center lg:gap-3">
                <span className="whitespace-nowrap text-2xs uppercase tracking-[0.3em] sm:text-xs">
                  {dayjs(doc.createdAt).format('DD MMM, HH:mm')}
                </span>
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => onPreview?.(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 min-h-[40px] text-2xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 active:scale-95 sm:flex-initial sm:rounded-full sm:px-3 sm:py-1.5 sm:min-h-0 sm:text-xs touch-manipulation"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownload?.(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-primary/50 px-3 py-2 min-h-[40px] text-2xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-white active:scale-95 sm:flex-initial sm:rounded-full sm:px-3 sm:py-1.5 sm:min-h-0 sm:text-xs touch-manipulation"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(doc)}
                      className="flex items-center justify-center rounded-lg border border-white/10 p-2 min-h-[40px] text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400 active:scale-95 opacity-0 group-hover:opacity-100 sm:rounded-full sm:p-1.5 sm:min-h-0 touch-manipulation"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(doc)}
                      className="flex items-center justify-center rounded-lg border border-white/10 p-2 min-h-[40px] text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400 active:scale-95 opacity-0 group-hover:opacity-100 sm:rounded-full sm:p-1.5 sm:min-h-0 touch-manipulation"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default RecentDocuments;

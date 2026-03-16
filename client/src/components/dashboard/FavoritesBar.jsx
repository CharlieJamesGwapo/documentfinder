import { Star, Eye, Download } from 'lucide-react';
import { getDocumentTypeConfig } from '../../constants/documentTypes.js';

const FavoritesBar = ({ favorites = [], onPreview, onDownload, onToggleFavorite }) => {
  if (favorites.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/5 bg-[#15161b] p-4 sm:p-6">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Favorites</p>
        <h3 className="font-heading text-base text-white sm:text-lg">{favorites.length} starred document{favorites.length !== 1 ? 's' : ''}</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {favorites.map((doc) => {
          const typeConfig = getDocumentTypeConfig(doc.documentType);
          return (
            <div
              key={doc.id}
              className="group flex min-w-[220px] max-w-[260px] shrink-0 flex-col justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-primary/20 hover:bg-white/[0.06] sm:min-w-[250px]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  {typeConfig && (
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-semibold ${typeConfig.color.bg} ${typeConfig.color.text} ${typeConfig.color.border}`}>
                      {typeConfig.code}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite?.(doc.id)}
                    className="rounded-full p-1 text-primary transition hover:bg-primary/10 active:scale-90"
                    title="Remove from favorites"
                  >
                    <Star className="h-3.5 w-3.5 fill-primary" />
                  </button>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-white">{doc.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{doc.category}</p>
              </div>
              <div className="mt-3 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onPreview?.(doc)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-2xs font-semibold text-white transition hover:border-primary hover:bg-primary/10 active:scale-95 touch-manipulation"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onDownload?.(doc)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-primary/40 px-2 py-1.5 text-2xs font-semibold text-primary transition hover:bg-primary hover:text-white active:scale-95 touch-manipulation"
                >
                  <Download className="h-3 w-3" />
                  Get
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FavoritesBar;

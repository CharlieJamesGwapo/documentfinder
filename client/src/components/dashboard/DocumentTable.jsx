import dayjs from 'dayjs';
import DocumentCard from './DocumentCard.jsx';
import { formatFileSize, getFormatLabel } from '../../utils/documents.js';
import { SkeletonCard, SkeletonTable } from '../common/Skeleton.jsx';

const DocumentTable = ({ documents, loading, pagination, onPageChange, onPreview, onDownload }) => {
  const handlePrev = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.page < pagination.pages) {
      onPageChange(pagination.page + 1);
    }
  };

  return (
    <section className="rounded-lg border border-white/5 bg-[#14151a] p-2.5 shadow-lg shadow-black/40 sm:rounded-2xl sm:p-6 animate-slide-up touch-manipulation">
      <div className="mb-2 flex flex-col items-start justify-between gap-1.5 sm:mb-4 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <p className="text-2xs uppercase tracking-[0.35em] text-primary/70 sm:text-xs">Documents</p>
          <h3 className="font-heading text-lg text-white sm:text-2xl">Operational library</h3>
        </div>
        <div className="text-2xs text-slate-400 sm:text-sm md:block">
          {pagination.total} results · Page {pagination.page} of {pagination.pages}
        </div>
      </div>

      <div className="hidden md:block">
        <table className="w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-3">Title</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Format</th>
              <th className="pb-3">Owner</th>
              <th className="pb-3">Updated</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <SkeletonTable />
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <div className="space-y-2">
                    <p className="text-slate-500">📄 No documents match your search.</p>
                    <p className="text-xs text-slate-600">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/5">
                  <td className="py-4">
                    <p className="font-semibold text-white">{doc.title}</p>
                    <p className="text-xs text-slate-500">v{doc.version}</p>
                  </td>
                  <td className="py-4 capitalize">{doc.documentType}</td>
                  <td className="py-4">{doc.category}</td>
                  <td className="py-4 text-sm text-slate-400">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{getFormatLabel(doc.fileType)}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>
                  </td>
                  <td className="py-4">{doc.author?.name ?? 'Unknown'}</td>
                  <td className="py-4">{dayjs(doc.updatedAt).format('DD MMM YYYY')}</td>
                  <td className="py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onPreview?.(doc)}
                        className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownload?.(doc)}
                        className="rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-white"
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-lg border border-white/5 bg-black/20 py-8 text-center sm:rounded-xl sm:py-10">
            <p className="text-sm text-slate-500 sm:text-base">📄 No documents match your search.</p>
            <p className="mt-1 text-2xs text-slate-600 sm:mt-2 sm:text-xs">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onPreview={onPreview}
                onDownload={onDownload}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 text-2xs text-slate-400 sm:mt-6 sm:gap-3 sm:text-sm md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          Showing page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={pagination.page === 1}
            className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-2xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 touch-manipulation tap-highlight sm:flex-initial sm:rounded-full sm:px-5 sm:text-xs"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={pagination.page === pagination.pages}
            className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-2xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 touch-manipulation tap-highlight sm:flex-initial sm:rounded-full sm:px-5 sm:text-xs"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default DocumentTable;

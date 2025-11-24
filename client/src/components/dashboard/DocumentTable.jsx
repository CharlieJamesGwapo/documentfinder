import dayjs from 'dayjs';
import DocumentCard from './DocumentCard.jsx';
import { formatFileSize, getFormatLabel } from '../../utils/documents.js';

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
    <section className="rounded-2xl border border-white/5 bg-[#14151a] p-6 shadow-lg shadow-black/40">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Documents</p>
          <h3 className="font-heading text-2xl text-white">Operational library</h3>
        </div>
        <div className="hidden text-sm text-slate-400 md:block">
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
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  Loading documents…
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  No documents match the filters.
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

      <div className="grid gap-4 md:hidden">
        {loading
          ? <p className="text-center text-slate-500">Loading…</p>
          : documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPreview={onPreview}
              onDownload={onDownload}
            />
          ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          Showing page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={pagination.page === 1}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={pagination.page === pagination.pages}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default DocumentTable;

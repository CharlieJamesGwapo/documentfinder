import dayjs from 'dayjs';

const RecentDocuments = ({ documents = [], onPreview, onDownload }) => (
  <section className="rounded-2xl border border-white/5 bg-[#15161b] p-6 shadow-lg shadow-black/40">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Recent</p>
        <h3 className="font-heading text-2xl text-white">Latest uploads</h3>
      </div>
    </div>

    {documents.length === 0 ? (
      <p className="py-6 text-sm text-slate-500">No recent documents yet.</p>
    ) : (
      <ul className="space-y-4">
        {documents.map((doc) => (
          <li key={doc.id} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-white">{doc.title}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{doc.category} · {doc.documentType}</p>
            </div>
            <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 lg:flex-row lg:items-center lg:gap-4">
              <span>{dayjs(doc.createdAt).format('DD MMM, HH:mm')}</span>
              <div className="flex flex-wrap gap-2">
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
                  className="rounded-full border border-primary/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-white"
                >
                  Download
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default RecentDocuments;

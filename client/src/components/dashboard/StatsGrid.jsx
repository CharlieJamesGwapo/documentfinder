import clsx from 'clsx';

const StatCard = ({ label, value, sublabel, accent, loading }) => (
  <div
    className={clsx(
      'rounded-2xl border border-white/5 bg-gradient-to-br from-[#1b1c22] to-[#111216] p-5 text-white shadow-lg shadow-black/40',
      accent === 'primary' && 'from-primary/10 to-primary/5 border-primary/20',
      accent === 'quality' && 'from-emerald-400/10 to-emerald-500/5 border-emerald-300/30'
    )}
  >
    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
    {loading ? (
      <div className="mt-4 h-9 w-24 animate-pulse rounded bg-white/10" />
    ) : (
      <p className="mt-3 font-heading text-3xl">{value}</p>
    )}
    {sublabel && (
      <p className="mt-1 text-sm text-slate-400">{sublabel}</p>
    )}
  </div>
);

const formatBytes = (bytes) => {
  if (!bytes) return '0 MB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** idx;
  return `${value.toFixed(1)} ${units[idx]}`;
};

const StatsGrid = ({ overview, loading }) => (
  <section>
    <div className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Overview</p>
        <h2 className="font-heading text-2xl text-white">Operations at a glance</h2>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Documents"
        value={overview?.totals?.totalDocuments ?? 0}
        sublabel={`${overview?.categoryBreakdown?.length ?? 0} categories`}
        accent="primary"
        loading={loading}
      />
      <StatCard
        label="Manufacturing"
        value={overview?.totals?.manufacturingCount ?? 0}
        sublabel="Active instructions"
        loading={loading}
      />
      <StatCard
        label="Quality"
        value={overview?.totals?.qualityCount ?? 0}
        sublabel="Inspection docs"
        accent="quality"
        loading={loading}
      />
      <StatCard
        label="Cloud Storage"
        value={formatBytes(overview?.storageBytes)}
        sublabel="Cloudinary usage"
        loading={loading}
      />
    </div>

    {overview?.categoryBreakdown?.length ? (
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
        {overview.categoryBreakdown.map((item) => (
          <span
            key={item.category}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
          >
            {item.category} · {item.count}
          </span>
        ))}
      </div>
    ) : null}
  </section>
);

export default StatsGrid;

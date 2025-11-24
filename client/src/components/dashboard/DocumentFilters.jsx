import { useMemo } from 'react';

const FILE_TYPE_OPTIONS = [
  { label: 'All formats', value: '' },
  { label: 'PDF', value: 'application/pdf' },
  { label: 'DOCX', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: 'DOC', value: 'application/msword' },
  { label: 'Images', value: 'image/%' }
];

const DocumentFilters = ({ filters, onChange, onReset, categories = [], tags = [] }) => {
  const categoryOptions = useMemo(() => ['All categories', ...categories], [categories]);

  return (
    <section className="rounded-2xl border border-white/5 bg-[#1c1d22] p-6 shadow-lg shadow-black/40">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Filters</p>
          <h3 className="font-heading text-2xl text-white">Search documents</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:text-primary"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <label className="space-y-2 text-sm">
          <span className="text-slate-300">Keyword</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="e.g. Battery Assembly"
            className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Instruction Type</span>
            <select
              value={filters.documentType}
              onChange={(event) => onChange({ documentType: event.target.value })}
              className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white focus:border-primary focus:outline-none"
            >
              <option value="">All types</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="quality">Quality</option>
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Category</span>
            <select
              value={filters.category}
              onChange={(event) => onChange({ category: event.target.value })}
              className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white focus:border-primary focus:outline-none"
            >
              <option value="">All categories</option>
              {categoryOptions.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-slate-300">Tag</span>
          <select
            value={filters.tag}
            onChange={(event) => onChange({ tag: event.target.value })}
            className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white focus:border-primary focus:outline-none"
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-300">Format</span>
          <select
            value={filters.fileType}
            onChange={(event) => onChange({ fileType: event.target.value })}
            className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white focus:border-primary focus:outline-none"
          >
            {FILE_TYPE_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            Filter between PDF, DOC/DOCX, or image-based instructions.
          </p>
        </label>
      </div>
    </section>
  );
};

export default DocumentFilters;

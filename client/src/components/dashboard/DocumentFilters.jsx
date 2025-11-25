import { useMemo, useState, useEffect } from 'react';

const FILE_TYPE_OPTIONS = [
  { label: 'All formats', value: '' },
  { label: 'PDF', value: 'application/pdf' },
  { label: 'DOCX', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: 'DOC', value: 'application/msword' },
  { label: 'Images', value: 'image/%' }
];

const DocumentFilters = ({ filters, onChange, onReset, categories = [], tags = [] }) => {
  const categoryOptions = useMemo(() => ['All categories', ...categories], [categories]);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isSearching, setIsSearching] = useState(false);

  // Sync search input when filters change externally (e.g., reset)
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Debounce search input - only search if input is not empty
  useEffect(() => {
    if (!searchInput.trim()) {
      onChange({ search: '' });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      onChange({ search: searchInput });
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]); // Remove onChange from dependencies to prevent infinite loop

  return (
    <section className="rounded-2xl border border-white/5 bg-[#1c1d22] p-4 shadow-lg shadow-black/40 sm:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Filters</p>
          <h3 className="font-heading text-xl text-white sm:text-2xl">Search documents</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary/20 sm:w-auto"
        >
          ↻ Reset
        </button>
      </div>

      <div className="space-y-4">
        <label className="space-y-2 text-sm">
          <span className="flex items-center justify-between text-slate-300">
            <span>Keyword</span>
            {isSearching && <span className="text-xs text-primary">Searching...</span>}
          </span>
          <div className="relative">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="e.g. Battery Assembly, Welding..."
              className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 pr-10 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">Real-time search across all documents</p>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Instruction Type</span>
            <select
              value={filters.documentType}
              onChange={(event) => onChange({ documentType: event.target.value })}
              className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white transition focus:border-primary focus:outline-none"
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
              className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white transition focus:border-primary focus:outline-none"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Tag</span>
            <select
              value={filters.tag}
              onChange={(event) => onChange({ tag: event.target.value })}
              className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white transition focus:border-primary focus:outline-none"
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
              className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-white transition focus:border-primary focus:outline-none"
            >
              {FILE_TYPE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-xs text-slate-500">
          💡 Filter between PDF, DOC/DOCX, or image-based instructions. Search updates in real-time.
        </p>
      </div>
    </section>
  );
};

export default DocumentFilters;

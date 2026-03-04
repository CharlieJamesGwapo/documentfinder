import { useMemo, useState, useEffect } from 'react';
import { SkeletonFilters } from '../common/Skeleton.jsx';

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
    <section className="rounded-lg border border-white/5 bg-[#1c1d22] p-2.5 shadow-lg shadow-black/40 sm:rounded-2xl sm:p-6 animate-slide-up touch-manipulation">
      <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-3">
        <div>
          <p className="text-2xs uppercase tracking-[0.35em] text-primary/70 sm:text-xs">Filters</p>
          <h3 className="font-heading text-base text-white sm:text-xl lg:text-2xl">Search documents</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary/20 active:scale-95 sm:w-auto sm:px-4 sm:py-2 sm:text-xs touch-manipulation tap-highlight"
        >
          ↻ Reset
        </button>
      </div>

      <div className="space-y-2.5 sm:space-y-4">
        <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
          <span className="flex items-center justify-between text-slate-300">
            <span>Keyword</span>
            {isSearching && <span className="text-2xs text-primary sm:text-xs">Searching...</span>}
          </span>
          <div className="relative">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="e.g. Battery Assembly..."
              inputMode="search"
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 pr-8 text-xs text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-white active:scale-90 sm:right-3 touch-manipulation tap-highlight"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-3xs text-slate-500 sm:text-xs">Real-time search across all documents</p>
        </label>

        <div className="grid gap-2 grid-cols-1 sm:gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
            <span className="text-slate-300">Instruction Type</span>
            <select
              value={filters.documentType}
              onChange={(event) => onChange({ documentType: event.target.value })}
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs text-white transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight"
            >
              <option value="">All types</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="quality">Quality</option>
            </select>
          </label>

          <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
            <span className="text-slate-300">Category</span>
            <select
              value={filters.category}
              onChange={(event) => onChange({ category: event.target.value })}
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs text-white transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight"
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

        <div className="grid gap-2 grid-cols-1 sm:gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
            <span className="text-slate-300">Tag</span>
            <select
              value={filters.tag}
              onChange={(event) => onChange({ tag: event.target.value })}
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs text-white transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight"
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
            <span className="text-slate-300">Format</span>
            <select
              value={filters.fileType}
              onChange={(event) => onChange({ fileType: event.target.value })}
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs text-white transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight"
            >
              {FILE_TYPE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-3xs text-slate-500 sm:text-xs">
          💡 Filter between PDF, DOC/DOCX, or image-based instructions. Search updates in real-time.
        </p>
      </div>
    </section>
  );
};

export default DocumentFilters;

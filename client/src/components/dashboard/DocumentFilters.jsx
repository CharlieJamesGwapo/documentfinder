import { useMemo, useState, useEffect } from 'react';
import { Filter, RotateCcw, Search, X } from 'lucide-react';
import { getAllDocumentTypes, getDocumentTypeConfig } from '../../constants/documentTypes.js';

const FILE_TYPE_OPTIONS = [
  { label: 'All formats', value: '' },
  { label: 'PDF', value: 'application/pdf' },
  { label: 'DOCX', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: 'DOC', value: 'application/msword' },
  { label: 'Images', value: 'image/%' }
];

const DocumentFilters = ({ filters, onChange, onReset, categories = [], tags = [], activeCount = 0 }) => {
  const categoryOptions = useMemo(() => ['All categories', ...categories], [categories]);
  const documentTypeOptions = useMemo(() => getAllDocumentTypes(), []);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      if (filters.search) onChange({ search: '' });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      onChange({ search: searchInput });
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Active filter chips for visual feedback
  const activeFilters = [];
  if (filters.documentType) {
    const config = getDocumentTypeConfig(filters.documentType);
    activeFilters.push({ key: 'documentType', label: config?.code || filters.documentType, color: config?.color?.text || 'text-white' });
  }
  if (filters.category) {
    activeFilters.push({ key: 'category', label: filters.category, color: 'text-blue-300' });
  }
  if (filters.tag) {
    activeFilters.push({ key: 'tag', label: `#${filters.tag}`, color: 'text-purple-300' });
  }
  if (filters.fileType) {
    const match = FILE_TYPE_OPTIONS.find(o => o.value === filters.fileType);
    activeFilters.push({ key: 'fileType', label: match?.label || 'Custom', color: 'text-emerald-300' });
  }

  const removeFilter = (key) => {
    onChange({ [key]: '' });
  };

  return (
    <section className="rounded-lg border border-white/5 bg-[#1c1d22] p-2.5 shadow-lg shadow-black/40 sm:rounded-2xl sm:p-6 animate-slide-up touch-manipulation">
      <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary/70 sm:h-5 sm:w-5" />
          <div>
            <p className="text-2xs uppercase tracking-[0.35em] text-primary/70 sm:text-xs">Filters</p>
            <h3 className="font-heading text-base text-white sm:text-xl lg:text-2xl">
              Search documents
              {activeCount > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-2xs font-bold text-white align-middle">
                  {activeCount}
                </span>
              )}
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0 && !searchInput}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto sm:px-4 sm:py-2 sm:text-xs touch-manipulation tap-highlight"
        >
          <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-2xs font-semibold sm:text-xs"
            >
              <span className={f.color}>{f.label}</span>
              <button
                type="button"
                onClick={() => removeFilter(f.key)}
                className="rounded-full p-0.5 text-slate-400 hover:text-white transition touch-manipulation"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2.5 sm:space-y-4">
        <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
          <span className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Keyword</span>
            </span>
            {isSearching && (
              <span className="flex items-center gap-1 text-2xs text-primary sm:text-xs">
                <div className="h-2 w-2 animate-spin rounded-full border border-primary border-t-transparent" />
                <span>Searching...</span>
              </span>
            )}
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
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="text-3xs text-slate-500 sm:text-xs">Real-time search across all documents</p>
        </label>

        <div className="grid gap-2 grid-cols-1 sm:gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
            <span className="text-slate-300">Document Type</span>
            <select
              value={filters.documentType}
              onChange={(event) => onChange({ documentType: event.target.value })}
              className={`w-full rounded-lg border bg-black/20 px-3 py-2 text-xs text-white transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight ${
                filters.documentType ? 'border-primary/30' : 'border-white/5'
              }`}
            >
              {documentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
            <span className="text-slate-300">Category</span>
            <select
              value={filters.category}
              onChange={(event) => onChange({ category: event.target.value })}
              className={`w-full rounded-lg border bg-black/20 px-3 py-2 text-xs text-white transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight ${
                filters.category ? 'border-primary/30' : 'border-white/5'
              }`}
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

        <div className="grid gap-2 grid-cols-1 sm:gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-2xs sm:space-y-2 sm:text-sm">
            <span className="text-slate-300">Tag</span>
            <select
              value={filters.tag}
              onChange={(event) => onChange({ tag: event.target.value })}
              className={`w-full rounded-lg border bg-black/20 px-3 py-2 text-xs text-white transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight ${
                filters.tag ? 'border-primary/30' : 'border-white/5'
              }`}
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
              className={`w-full rounded-lg border bg-black/20 px-3 py-2 text-xs text-white transition focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm touch-manipulation tap-highlight ${
                filters.fileType ? 'border-primary/30' : 'border-white/5'
              }`}
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
          Filter between PDF, DOC/DOCX, or image-based instructions. Search updates in real-time.
        </p>
      </div>
    </section>
  );
};

export default DocumentFilters;

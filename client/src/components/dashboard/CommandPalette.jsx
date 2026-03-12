import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import api from '../../lib/api.js';
import { getDocumentTypeConfig } from '../../constants/documentTypes.js';

const CommandPalette = ({ open, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/documents', { params: { search: query, limit: 8 } });
        setResults(data.documents || []);
        setSelectedIndex(0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onSelect?.(results[selectedIndex]);
      onClose();
    }
  }, [results, selectedIndex, onSelect, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#15161b]/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documents..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[0.65rem] text-slate-400">
            ESC
          </kbd>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          )}
          {!loading && query && results.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No documents found for &quot;{query}&quot;</p>
          )}
          {!loading && !query && (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-2 text-sm text-slate-500">Start typing to search documents</p>
              <p className="mt-1 text-xs text-slate-600">Search by title, description, or content</p>
            </div>
          )}
          {!loading && results.map((doc, i) => {
            const typeConfig = getDocumentTypeConfig(doc.documentType);
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => { onSelect?.(doc); onClose(); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  i === selectedIndex ? 'bg-primary/10 text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {typeConfig && (
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-semibold ${typeConfig.color.bg} ${typeConfig.color.text} ${typeConfig.color.border}`}>
                    <span>{typeConfig.icon}</span>
                    <span>{typeConfig.code}</span>
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="truncate text-xs text-slate-500">{doc.category}</p>
                </div>
                <ArrowRight className={`h-4 w-4 shrink-0 ${i === selectedIndex ? 'text-primary' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[0.65rem] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-slate-400">&uarr;&darr;</kbd> Navigate</span>
            <span><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-slate-400">&crarr;</kbd> Select</span>
          </div>
          <span><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-slate-400">Ctrl+K</kbd> Toggle</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

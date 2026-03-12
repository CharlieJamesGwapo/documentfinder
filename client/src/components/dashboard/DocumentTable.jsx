import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Download, Eye, FileDown, FileUp, ChevronDown, Pencil, Trash2, Star } from 'lucide-react';
import DocumentCard from './DocumentCard.jsx';
import { formatFileSize, getFormatLabel } from '../../utils/documents.js';
import { getDocumentTypeConfig } from '../../constants/documentTypes.js';
import { SkeletonCard, SkeletonTable } from '../common/Skeleton.jsx';
import { fetchAllAndExport, downloadImportTemplate } from '../../utils/exportDocuments.js';
import api from '../../lib/api.js';

const DocumentTable = ({ documents, loading, pagination, onPageChange, onPreview, onDownload, onEdit, onDelete, filters, onImported, isAdmin, onToggleFavorite, isFavorite }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const exportMenuRef = useRef(null);
  const importMenuRef = useRef(null);
  const csvInputRef = useRef(null);
  const bulkInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
      if (importMenuRef.current && !importMenuRef.current.contains(e.target)) {
        setShowImportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setShowExportMenu(false);
    setExporting(true);
    try {
      await fetchAllAndExport(format, filters || {});
      toast.success(`Exported all documents as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(error?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setImporting(true);
    setShowImportMenu(false);
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      const { data } = await api.post('/documents/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Imported ${data.created} documents${data.failed ? ` (${data.failed} failed)` : ''}`);
      onImported?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'CSV import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    e.target.value = '';

    setImporting(true);
    setShowImportMenu(false);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('documents', file);
      }
      formData.append('documentType', 'MN');
      formData.append('category', 'General');
      const { data } = await api.post('/documents/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Uploaded ${data.created} files${data.failed ? ` (${data.failed} failed)` : ''}`);
      onImported?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk upload failed');
    } finally {
      setImporting(false);
    }
  };

  const handlePrev = () => {
    if (pagination.page > 1) onPageChange(pagination.page - 1);
  };

  const handleNext = () => {
    if (pagination.page < pagination.pages) onPageChange(pagination.page + 1);
  };

  // Page number buttons
  const pageNumbers = [];
  const maxVisiblePages = 5;
  if (pagination.pages <= maxVisiblePages) {
    for (let i = 1; i <= pagination.pages; i++) pageNumbers.push(i);
  } else {
    const start = Math.max(1, pagination.page - 2);
    const end = Math.min(pagination.pages, start + maxVisiblePages - 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
  }

  return (
    <section className="rounded-lg border border-white/5 bg-[#14151a] p-2.5 shadow-lg shadow-black/40 sm:rounded-2xl sm:p-6 animate-slide-up touch-manipulation">
      <div className="mb-2 flex flex-col items-start justify-between gap-1.5 sm:mb-4 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <p className="text-2xs uppercase tracking-[0.35em] text-primary/70 sm:text-xs">Documents</p>
          <h3 className="font-heading text-lg text-white sm:text-2xl">Operational library</h3>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-2xs text-slate-400 sm:text-sm">
            {pagination.total} results · Page {pagination.page} of {pagination.pages}
          </div>

          {/* Import Button - Admin Only */}
          {isAdmin && <div className="relative" ref={importMenuRef}>
            <input type="file" ref={csvInputRef} accept=".csv" className="hidden" onChange={handleCSVImport} />
            <input type="file" ref={bulkInputRef} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleBulkUpload} />
            <button
              type="button"
              onClick={() => setShowImportMenu((prev) => !prev)}
              disabled={importing}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-white transition hover:border-emerald-400 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:py-2 sm:text-xs"
              aria-haspopup="true"
              aria-expanded={showImportMenu}
            >
              {importing ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FileUp className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{importing ? 'Importing...' : 'Import'}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showImportMenu && (
              <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-white/10 bg-[#1a1b22] p-1.5 shadow-xl shadow-black/50">
                <button type="button" onClick={() => { csvInputRef.current?.click(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-slate-300 transition hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation">
                  <span className="text-xs text-emerald-400">CSV</span>
                  <span>Import from CSV</span>
                </button>
                <button type="button" onClick={() => { bulkInputRef.current?.click(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-slate-300 transition hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation">
                  <span className="text-xs text-blue-400">Files</span>
                  <span>Bulk File Upload</span>
                </button>
                <div className="border-t border-white/5 mt-1 pt-1">
                  <button type="button" onClick={() => { downloadImportTemplate(); setShowImportMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-slate-300 transition hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation">
                    <span className="text-xs text-slate-500">TPL</span>
                    <span>Download CSV Template</span>
                  </button>
                </div>
              </div>
            )}
          </div>}

          {/* Export Button */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu((prev) => !prev)}
              disabled={!documents.length || exporting}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:py-2 sm:text-xs"
              aria-haspopup="true"
              aria-expanded={showExportMenu}
            >
              {exporting ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FileDown className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-white/10 bg-[#1a1b22] p-1.5 shadow-xl shadow-black/50">
                <button type="button" onClick={() => handleExport('csv')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-slate-300 transition hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation">
                  <span className="text-xs text-emerald-400">CSV</span>
                  <span>Excel / Spreadsheet</span>
                </button>
                <button type="button" onClick={() => handleExport('pdf')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-slate-300 transition hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation">
                  <span className="text-xs text-red-400">PDF</span>
                  <span>PDF Document</span>
                </button>
                <button type="button" onClick={() => handleExport('word')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-slate-300 transition hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation">
                  <span className="text-xs text-blue-400">DOC</span>
                  <span>Word Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
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
                    <p className="text-slate-500">No documents match your search.</p>
                    <p className="text-xs text-slate-600">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const typeConfig = getDocumentTypeConfig(doc.documentType);
                return (
                  <tr key={doc.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <p className="font-semibold text-white">{doc.title}</p>
                      <p className="text-xs text-slate-500">v{doc.version}</p>
                    </td>
                    <td className="py-4">
                      {typeConfig && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${typeConfig.color.bg} ${typeConfig.color.text} ${typeConfig.color.border}`}>
                          <span>{typeConfig.icon}</span>
                          <span>{typeConfig.code}</span>
                        </span>
                      )}
                    </td>
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
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreview?.(doc)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10 active:scale-95"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDownload?.(doc)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-white active:scale-95"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Download</span>
                        </button>
                        {onToggleFavorite && (
                          <button
                            type="button"
                            onClick={() => onToggleFavorite(doc.id)}
                            className={`inline-flex items-center justify-center rounded-full border p-1.5 transition active:scale-95 ${
                              isFavorite?.(doc.id)
                                ? 'border-amber-400/30 bg-amber-500/10 text-amber-400'
                                : 'border-white/10 text-slate-400 hover:border-amber-400/30 hover:bg-amber-500/10 hover:text-amber-400'
                            }`}
                            title={isFavorite?.(doc.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className="h-3.5 w-3.5" fill={isFavorite?.(doc.id) ? 'currentColor' : 'none'} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(doc)}
                            className="inline-flex items-center justify-center rounded-full border border-white/10 p-1.5 text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400 active:scale-95 opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(doc)}
                            className="inline-flex items-center justify-center rounded-full border border-white/10 p-1.5 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400 active:scale-95 opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-lg border border-white/5 bg-black/20 py-8 text-center sm:rounded-xl sm:py-10">
            <p className="text-sm text-slate-500 sm:text-base">No documents match your search.</p>
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
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite?.(doc.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-3 flex flex-col gap-2 text-2xs text-slate-400 sm:mt-6 sm:gap-3 sm:text-sm md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} documents)
          </div>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={pagination.page === 1}
              className="rounded-lg border border-white/10 px-3 py-2 min-h-[40px] text-2xs font-semibold text-white transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 touch-manipulation sm:rounded-full sm:px-4 sm:text-xs"
            >
              Prev
            </button>
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onPageChange(num)}
                className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition active:scale-95 touch-manipulation ${
                  num === pagination.page
                    ? 'bg-primary text-white'
                    : 'border border-white/10 text-slate-400 hover:border-primary hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleNext}
              disabled={pagination.page === pagination.pages}
              className="rounded-lg border border-white/10 px-3 py-2 min-h-[40px] text-2xs font-semibold text-white transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 touch-manipulation sm:rounded-full sm:px-4 sm:text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DocumentTable;

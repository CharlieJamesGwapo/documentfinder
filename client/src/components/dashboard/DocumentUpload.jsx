import { useState, useMemo, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { getAllDocumentTypes } from '../../constants/documentTypes.js';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

const formatSize = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const initialState = {
  title: '',
  description: '',
  documentType: 'MN',
  category: '',
  tags: '',
  version: '1.0.0'
};

const DocumentUpload = ({ onUploaded, categorySuggestions = [] }) => {
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const documentTypeOptions = useMemo(() => getAllDocumentTypes(), []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      toast.error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error('File size must be under 20 MB');
      return;
    }

    setFile(selectedFile);

    // Auto-fill title from filename if empty
    if (!form.title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      handleChange('title', nameWithoutExt);
    }
  }, [form.title]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error('Please attach a document file');
      return;
    }

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!form.category.trim()) {
      toast.error('Category is required');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('document', file);

    setUploading(true);
    setUploadProgress(0);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        }
      });

      setUploadSuccess(true);
      toast.success('Document uploaded successfully!');

      // Reset after brief success animation
      setTimeout(() => {
        setForm(initialState);
        setFile(null);
        setUploadProgress(0);
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onUploaded?.();
      }, 1200);
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed';
      toast.error(message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-lg border border-white/5 bg-gradient-to-br from-[#1f2026] to-[#15161b] p-3 shadow-glow sm:rounded-2xl sm:p-6">
      <div className="mb-2">
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Upload</p>
        <h3 className="font-heading text-lg text-white sm:text-xl lg:text-2xl">New document</h3>
      </div>
      <p className="mb-3 text-2xs text-slate-400 sm:mb-5 sm:text-xs">Upload manufacturing, quality, or process documents</p>

      <form className="space-y-2.5 sm:space-y-4" onSubmit={handleSubmit}>
        {/* Drag & Drop Zone */}
        <div
          className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-all cursor-pointer sm:p-6 ${
            dragActive
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : file
              ? 'border-primary/30 bg-primary/5'
              : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                <p className="text-2xs text-slate-400">{formatSize(file.size)} · {file.type.split('/').pop().toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 touch-manipulation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className={`mx-auto h-8 w-8 ${dragActive ? 'text-primary' : 'text-slate-500'}`} />
              <p className="text-xs text-slate-400 sm:text-sm">
                {dragActive ? (
                  <span className="text-primary font-semibold">Drop file here</span>
                ) : (
                  <>
                    <span className="text-primary font-semibold">Click to browse</span> or drag & drop
                  </>
                )}
              </p>
              <p className="text-2xs text-slate-500">PDF, DOC, DOCX, JPG, PNG (max 20 MB)</p>
            </div>
          )}
        </div>

        <label className="block space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
          <span className="text-slate-300">Title <span className="text-red-400">*</span></span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-2.5"
            placeholder="Battery pack QA"
          />
        </label>

        <label className="block space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
          <span className="text-slate-300">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none resize-none sm:rounded-xl sm:px-4 sm:py-2.5"
            placeholder="Short summary of the document"
          />
        </label>

        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <label className="block space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
            <span className="text-slate-300">Document Type <span className="text-red-400">*</span></span>
            <select
              value={form.documentType}
              onChange={(e) => handleChange('documentType', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-2.5 touch-manipulation"
              required
            >
              {documentTypeOptions.slice(1).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
            <span className="text-slate-300">Category <span className="text-red-400">*</span></span>
            <input
              list="category-options"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-2.5"
              placeholder="Powertrain"
            />
            <datalist id="category-options">
              {categorySuggestions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="grid gap-2 sm:gap-3 grid-cols-2">
          <label className="block space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
            <span className="text-slate-300">Tags</span>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-2.5"
              placeholder="battery, torque"
            />
          </label>

          <label className="block space-y-1 text-xs sm:space-y-1.5 sm:text-sm">
            <span className="text-slate-300">Version</span>
            <input
              type="text"
              value={form.version}
              onChange={(e) => handleChange('version', e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none sm:rounded-xl sm:px-4 sm:py-2.5"
            />
          </label>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-2xs text-slate-400">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-glow transition active:scale-95 disabled:cursor-not-allowed sm:rounded-xl sm:py-3 sm:text-sm touch-manipulation tap-highlight ${
            uploadSuccess
              ? 'bg-primary shadow-primary/30'
              : 'bg-primary hover:bg-primary/90 disabled:opacity-60'
          }`}
        >
          {uploadSuccess ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Uploaded!</span>
            </>
          ) : uploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
};

export default DocumentUpload;

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import DocumentFilters from '../../components/dashboard/DocumentFilters.jsx';
import DocumentUpload from '../../components/dashboard/DocumentUpload.jsx';
import DocumentCard from '../../components/dashboard/DocumentCard.jsx';
import StatsGrid from '../../components/dashboard/StatsGrid.jsx';
import DocumentTable from '../../components/dashboard/DocumentTable.jsx';
import RecentDocuments from '../../components/dashboard/RecentDocuments.jsx';
import PreviewModal from '../../components/dashboard/PreviewModal.jsx';
import { downloadDocumentFile } from '../../utils/documents.js';

const initialFilters = {
  search: '',
  documentType: '',
  category: '',
  tag: '',
  fileType: ''
};

const Dashboard = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [documents, setDocuments] = useState([]);
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [activeDocument, setActiveDocument] = useState(null);

  const fetchOverview = async () => {
    try {
      const { data } = await api.get('/documents/overview');
      setOverview(data);
    } catch (error) {
      console.error('Overview error', error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchDocuments = async (page = 1, currentFilters = filters) => {
    setLoadingDocuments(true);
    try {
      const params = {
        page,
        limit: 8,
        search: currentFilters.search || undefined,
        documentType: currentFilters.documentType || undefined,
        category: currentFilters.category || undefined,
        tags: currentFilters.tag || undefined,
        fileType: currentFilters.fileType || undefined
      };
      const { data } = await api.get('/documents', { params });
      setDocuments(data.documents || []);
      setPagination({
        page: data.pagination?.page || 1,
        pages: data.pagination?.pages || 1,
        total: data.pagination?.total || 0
      });
    } catch (error) {
      console.error('Document list error', error);
      // Only show toast on actual errors, not on rate limiting
      if (error.response?.status !== 429) {
        toast.error('Unable to load documents');
      }
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        api.get('/documents/categories'),
        api.get('/documents/tags')
      ]);
      setCategories(catRes.data || []);
      setTags(tagRes.data || []);
    } catch (error) {
      console.error('Ref data error', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOverview();
    fetchReferenceData();
  }, []);

  // When filters change, fetch documents from page 1
  useEffect(() => {
    fetchDocuments(1, filters);
  }, [filters.search, filters.documentType, filters.category, filters.tag, filters.fileType]);

  // When pagination page changes, fetch documents
  useEffect(() => {
    if (pagination.page > 1) {
      fetchDocuments(pagination.page, filters);
    }
  }, [pagination.page]);

  // Real-time updates - fetch overview every 30 seconds
  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleDocumentUploaded = () => {
    fetchOverview();
    fetchDocuments(1);
  };

  const handlePreviewDocument = (doc) => {
    setActiveDocument(doc);
  };

  const handleClosePreview = () => {
    setActiveDocument(null);
  };

  const handleDownloadDocument = async (doc, preferredExtension) => {
    if (!doc) return;
    try {
      await downloadDocumentFile({ doc, preferredExtension });
      toast.success('Download started');
    } catch (error) {
      toast.error(error?.message || 'Unable to download file');
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Stats Grid - Full Width */}
      <div>
        <StatsGrid overview={overview} loading={loadingOverview} />
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-4">
        {/* Sidebar - Filters and Upload */}
        <div className="space-y-6 lg:col-span-1">
          <DocumentFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            categories={categories}
            tags={tags}
          />
          <DocumentUpload
            onUploaded={handleDocumentUploaded}
            categorySuggestions={categories}
          />
        </div>

        {/* Main Content - Documents */}
        <div className="space-y-6 lg:col-span-3">
          <RecentDocuments
            documents={overview?.recentDocuments || []}
            onPreview={handlePreviewDocument}
            onDownload={handleDownloadDocument}
          />
          <DocumentTable
            documents={documents}
            loading={loadingDocuments}
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onPreview={handlePreviewDocument}
            onDownload={handleDownloadDocument}
          />
        </div>
      </div>

      <PreviewModal
        open={Boolean(activeDocument)}
        document={activeDocument}
        onClose={handleClosePreview}
        onDownload={handleDownloadDocument}
      />
    </div>
  );
};

export default Dashboard;

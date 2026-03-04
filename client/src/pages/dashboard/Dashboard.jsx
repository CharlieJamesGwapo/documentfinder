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
import AnalyticsDashboard from '../../components/dashboard/AnalyticsDashboard.jsx';
import { downloadDocumentFile } from '../../utils/documents.js';
import usePullToRefresh from '../../hooks/usePullToRefresh.js';
import useSwipeGesture from '../../hooks/useSwipeGesture.js';

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pull to refresh functionality
  const refreshData = async () => {
    await Promise.all([
      fetchOverview(),
      fetchDocuments(1, filters),
      fetchReferenceData()
    ]);
  };

  const {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullIndicatorOpacity,
    shouldRefresh
  } = usePullToRefresh(refreshData);

  // Swipe gesture for mobile filters
  const handleSwipeLeft = () => {
    setShowMobileFilters(false);
  };

  const handleSwipeRight = () => {
    setShowMobileFilters(true);
  };

  const swipeRef = useSwipeGesture(handleSwipeLeft, handleSwipeRight);

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
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8" ref={containerRef}>
      {/* Pull to Refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          opacity: pullIndicatorOpacity
        }}
      >
        <div className={`flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary backdrop-blur-sm ${shouldRefresh ? 'animate-bounce-gentle' : ''}`}>
          {isRefreshing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{shouldRefresh ? 'Release to refresh' : 'Pull to refresh'}</span>
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="fixed bottom-4 right-4 z-40 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg touch-manipulation tap-highlight active:scale-95 transition-transform"
        >
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Stats Grid - Full Width - Responsive */}
      <div className="animate-fadeIn">
        <StatsGrid overview={overview} loading={loadingOverview} />
      </div>

      {/* Analytics Dashboard - Full Width - Responsive */}
      <div className="animate-fadeIn">
        <AnalyticsDashboard overview={overview} loading={loadingOverview} />
      </div>

      {/* Main Content - Responsive Grid - Mobile First */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-4" ref={swipeRef}>
        {/* Sidebar - Filters and Upload - Collapsible on Mobile */}
        <div className={`space-y-3 sm:space-y-4 md:space-y-6 lg:col-span-1 animate-slideInLeft ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
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

        {/* Main Content - Documents - Full Width on Mobile */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:col-span-3 animate-slideInRight">
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

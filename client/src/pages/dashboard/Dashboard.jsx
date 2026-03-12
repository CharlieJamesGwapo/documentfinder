import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DocumentFilters from '../../components/dashboard/DocumentFilters.jsx';
import DocumentUpload from '../../components/dashboard/DocumentUpload.jsx';
import StatsGrid from '../../components/dashboard/StatsGrid.jsx';
import DocumentTable from '../../components/dashboard/DocumentTable.jsx';
import RecentDocuments from '../../components/dashboard/RecentDocuments.jsx';
import PreviewModal from '../../components/dashboard/PreviewModal.jsx';
import EditDocumentModal from '../../components/dashboard/EditDocumentModal.jsx';
import AnalyticsDashboard from '../../components/dashboard/AnalyticsDashboard.jsx';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner.jsx';
import FavoritesBar from '../../components/dashboard/FavoritesBar.jsx';
import ActivityFeed from '../../components/dashboard/ActivityFeed.jsx';
import CommandPalette from '../../components/dashboard/CommandPalette.jsx';
import { downloadDocumentFile } from '../../utils/documents.js';
import usePullToRefresh from '../../hooks/usePullToRefresh.js';
import useSwipeGesture from '../../hooks/useSwipeGesture.js';
import useFavorites from '../../hooks/useFavorites.js';
import useKeyboardSearch from '../../hooks/useKeyboardSearch.js';

const initialFilters = {
  search: '',
  documentType: '',
  category: '',
  tag: '',
  fileType: ''
};

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { isOpen: searchOpen, open: openSearch, close: closeSearch } = useKeyboardSearch();
  const [filters, setFilters] = useState(initialFilters);
  const [documents, setDocuments] = useState([]);
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [activeDocument, setActiveDocument] = useState(null);
  const [editDocument, setEditDocument] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const { data } = await api.get('/documents/overview');
      setOverview(data);
    } catch (error) {
      console.error('Overview error', error);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchDocuments = useCallback(async (page = 1, currentFilters = filters) => {
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
      if (error.response?.status !== 429) {
        toast.error('Unable to load documents');
      }
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  const fetchReferenceData = useCallback(async () => {
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
  }, []);

  // Pull to refresh
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchOverview(),
      fetchDocuments(1, filters),
      fetchReferenceData()
    ]);
  }, [fetchOverview, fetchDocuments, fetchReferenceData, filters]);

  const {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullIndicatorOpacity,
    shouldRefresh
  } = usePullToRefresh(refreshData);

  // Swipe gesture for mobile filters
  const swipeRef = useSwipeGesture(
    () => setShowMobileFilters(false),
    () => setShowMobileFilters(true)
  );

  // Initial load + periodic refresh
  useEffect(() => {
    fetchOverview();
    fetchReferenceData();
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, [fetchOverview, fetchReferenceData]);

  // When filters change, reset to page 1 and fetch
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchDocuments(1, filters);
  }, [filters.search, filters.documentType, filters.category, filters.tag, filters.fileType]);

  // When pagination page changes (beyond page 1), fetch documents
  useEffect(() => {
    if (pagination.page > 1) {
      fetchDocuments(pagination.page, filters);
    }
  }, [pagination.page]);

  const handleFilterChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Refresh everything after data changes
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchOverview(),
      fetchDocuments(pagination.page, filters),
      fetchReferenceData()
    ]);
  }, [fetchOverview, fetchDocuments, fetchReferenceData, pagination.page, filters]);

  const handleDocumentUploaded = () => {
    refreshAll();
  };

  const handlePreviewDocument = (doc) => {
    setActiveDocument(doc);
  };

  const handleClosePreview = () => {
    setActiveDocument(null);
  };

  const handleEditDocument = (doc) => {
    setEditDocument(doc);
  };

  const handleEditSaved = () => {
    setEditDocument(null);
    refreshAll();
  };

  const handleDeleteDocument = async (doc) => {
    if (!doc?.id) return;

    const result = await Swal.fire({
      title: 'Delete Document?',
      html: `<p style="color:#94a3b8">Are you sure you want to delete <strong style="color:#fff">${doc.title}</strong>?</p><p style="color:#64748b;font-size:0.85em;margin-top:8px">This action will archive the document.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#1a1b22',
      color: '#fff',
      customClass: {
        popup: 'border border-white/10 rounded-2xl',
        confirmButton: 'rounded-xl px-6',
        cancelButton: 'rounded-xl px-6'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/documents/${doc.id}`);
      toast.success('Document deleted');
      refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleSeedDocuments = async () => {
    setSeeding(true);
    try {
      const { data } = await api.post('/seed');
      toast.success(`${data.created} sample documents created!`);
      await refreshAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to seed documents');
    } finally {
      setSeeding(false);
    }
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

  // Count active filters
  const activeFilterCount = [filters.search, filters.documentType, filters.category, filters.tag, filters.fileType].filter(Boolean).length;

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
          className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full bg-primary/90 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/30 backdrop-blur-sm touch-manipulation tap-highlight active:scale-95 transition-all sm:text-sm"
        >
          {showMobileFilters ? 'Hide Filters' : 'Filters'}
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary text-2xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Welcome Banner */}
      <WelcomeBanner overview={overview} onOpenSearch={openSearch} />

      {/* Stats Grid */}
      <div className="animate-fadeIn">
        <StatsGrid overview={overview} loading={loadingOverview} />
      </div>

      {/* Favorites Bar */}
      {favorites.length > 0 && (
        <div className="animate-fadeIn">
          <FavoritesBar
            favorites={favorites}
            onPreview={handlePreviewDocument}
            onDownload={handleDownloadDocument}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      )}

      {/* Empty State - Seed Documents Banner */}
      {!loadingOverview && isAdmin && (overview?.totals?.totalDocuments ?? 0) < 1 && (
        <div className="animate-fadeIn rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-2xl sm:h-14 sm:w-14">
              📄
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white sm:text-lg">No documents yet</h3>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Your vault is empty. Load 30 sample documents across all 6 document types (MN, MI, QI, QAN, VA, PCA) to get started.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSeedDocuments}
              disabled={seeding}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:opacity-60 sm:px-6 sm:py-3 sm:text-sm touch-manipulation"
            >
              {seeding ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Seeding...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Load Sample Data
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      <div className="animate-fadeIn">
        <AnalyticsDashboard overview={overview} loading={loadingOverview} documents={documents} />
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-4" ref={swipeRef}>
        {/* Sidebar - Filters and Upload */}
        <div className={`space-y-3 sm:space-y-4 md:space-y-6 lg:col-span-1 animate-slideInLeft ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <DocumentFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            categories={categories}
            tags={tags}
            activeCount={activeFilterCount}
          />
          {isAdmin && (
            <DocumentUpload
              onUploaded={handleDocumentUploaded}
              categorySuggestions={categories}
            />
          )}
          <ActivityFeed />
        </div>

        {/* Main Content - Documents */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:col-span-3 animate-slideInRight">
          <RecentDocuments
            documents={overview?.recentDocuments || []}
            onPreview={handlePreviewDocument}
            onDownload={handleDownloadDocument}
            onEdit={isAdmin ? handleEditDocument : undefined}
            onDelete={isAdmin ? handleDeleteDocument : undefined}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
          <DocumentTable
            documents={documents}
            loading={loadingDocuments}
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onPreview={handlePreviewDocument}
            onDownload={handleDownloadDocument}
            onEdit={isAdmin ? handleEditDocument : undefined}
            onDelete={isAdmin ? handleDeleteDocument : undefined}
            filters={filters}
            onImported={refreshAll}
            isAdmin={isAdmin}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        </div>
      </div>

      <PreviewModal
        open={Boolean(activeDocument)}
        document={activeDocument}
        onClose={handleClosePreview}
        onDownload={handleDownloadDocument}
      />

      {isAdmin && (
        <EditDocumentModal
          open={Boolean(editDocument)}
          document={editDocument}
          onClose={() => setEditDocument(null)}
          onSaved={handleEditSaved}
          categories={categories}
        />
      )}

      <CommandPalette
        open={searchOpen}
        onClose={closeSearch}
        onSelect={handlePreviewDocument}
      />
    </div>
  );
};

export default Dashboard;

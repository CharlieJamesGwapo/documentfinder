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

  const filterParams = useMemo(() => ({ ...filters }), [filters]);

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

  const fetchDocuments = async (page = 1) => {
    setLoadingDocuments(true);
    try {
      const params = {
        page,
        limit: 8,
        search: filterParams.search || undefined,
        documentType: filterParams.documentType || undefined,
        category: filterParams.category || undefined,
        tags: filterParams.tag || undefined,
        fileType: filterParams.fileType || undefined
      };
      const { data } = await api.get('/documents', { params });
      setDocuments(data.documents);
      setPagination({
        page: data.pagination.page,
        pages: data.pagination.pages,
        total: data.pagination.total
      });
    } catch (error) {
      console.error('Document list error', error);
      toast.error('Unable to load documents');
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
      setCategories(catRes.data);
      setTags(tagRes.data);
    } catch (error) {
      console.error('Ref data error', error);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchDocuments(1);
    setPagination((prev) => ({ ...prev, page: 1 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams]);

  useEffect(() => {
    fetchDocuments(pagination.page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  useEffect(() => {
    const interval = setInterval(fetchOverview, 60000);
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
    <div className="flex w-full flex-col gap-8 lg:flex-row">
      <div className="lg:w-1/3 xl:w-1/4">
        <div className="space-y-6">
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
      </div>

      <div className="lg:w-2/3 xl:w-3/4">
        <div className="space-y-6">
          <StatsGrid overview={overview} loading={loadingOverview} />
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
          <div className="grid gap-4 md:hidden">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onPreview={handlePreviewDocument}
                onDownload={handleDownloadDocument}
              />
            ))}
          </div>
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

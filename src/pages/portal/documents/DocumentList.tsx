import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FolderOpen,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  FileImage,
  FileCheck,
  FileText,
  File,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  Home,
  Briefcase,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  description: string | null;
  is_customer_visible: boolean;
  job_id: string | null;
  job_number: string | null;
  job_title: string | null;
  property_id: string | null;
  property_address: string | null;
  property_postcode: string | null;
  customer_id: string | null;
  customer_name: string | null;
  company_id: string | null;
  company_name: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

interface Job {
  id: string;
  job_number: string;
  title: string;
}

interface Property {
  id: string;
  address_line1: string;
  postcode: string;
}

const DOCUMENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'photo', label: 'Photos' },
  { value: 'certificate', label: 'Certificates' },
  { value: 'eicr', label: 'EICR Reports' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'quote', label: 'Quotes' },
  { value: 'other', label: 'Other' },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'photo', label: 'Photo' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'eicr', label: 'EICR Report' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'quote', label: 'Quote' },
  { value: 'other', label: 'Other' },
];

const DOCUMENT_ICONS: Record<string, typeof FileText> = {
  photo: FileImage,
  certificate: FileCheck,
  eicr: File,
  invoice: FileText,
  quote: FileText,
};

export default function DocumentList() {
  const { isStaff } = usePortalAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    document_type: 'other',
    description: '',
    job_id: '',
    property_id: '',
    is_customer_visible: false,
  });

  useEffect(() => {
    fetchDocuments();
  }, [page, searchTerm, typeFilter]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('document_type', typeFilter);

      const response = await fetch(`/api/portal/documents?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [jobsRes, propsRes] = await Promise.all([
        fetch('/api/portal/jobs?limit=500', { credentials: 'include' }),
        fetch('/api/portal/properties?limit=500', { credentials: 'include' }),
      ]);

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
      }
      if (propsRes.ok) {
        const data = await propsRes.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Failed to fetch dropdowns:', error);
    }
  };

  const handleDownload = (doc: Document) => {
    window.open(`/api/portal/documents/${doc.id}/download`, '_blank');
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/portal/documents/${doc.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess('Document deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
        fetchDocuments();
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleToggleVisibility = async (doc: Document) => {
    try {
      const response = await fetch(`/api/portal/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_customer_visible: !doc.is_customer_visible }),
      });

      if (response.ok) {
        setSuccess(`Document ${doc.is_customer_visible ? 'hidden from' : 'visible to'} customers`);
        setTimeout(() => setSuccess(null), 3000);
        fetchDocuments();
      }
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // First upload the file
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload?type=documents', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      // Then create the document record
      const docResponse = await fetch('/api/portal/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          file_name: selectedFile.name,
          file_url: uploadData.url,
          document_type: uploadForm.document_type,
          description: uploadForm.description || null,
          job_id: uploadForm.job_id || null,
          property_id: uploadForm.property_id || null,
          is_customer_visible: uploadForm.is_customer_visible,
        }),
      });

      if (!docResponse.ok) {
        const data = await docResponse.json();
        throw new Error(data.error || 'Failed to create document record');
      }

      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadForm({
        document_type: 'other',
        description: '',
        job_id: '',
        property_id: '',
        is_customer_visible: false,
      });
      setSuccess('Document uploaded successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchDocuments();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    const IconComponent = DOCUMENT_ICONS[type] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const totalPages = Math.ceil(total / limit);

  if (!isStaff) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Document Library</h1>
            <p className="text-slate-500">Manage certificates, photos, and documents</p>
          </div>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter || 'all'}
              onValueChange={(value) => {
                setTypeFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No documents found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Linked To</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded">
                            {getDocumentIcon(doc.document_type)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.file_name}</p>
                            {doc.description && (
                              <p className="text-xs text-slate-500">{doc.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize px-2 py-1 bg-slate-100 rounded">
                          {doc.document_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {doc.job_number && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-slate-400" />
                              <Link to={`/portal/jobs/${doc.job_id}`} className="text-primary hover:underline">
                                {doc.job_number}
                              </Link>
                            </div>
                          )}
                          {doc.property_address && (
                            <div className="flex items-center gap-1">
                              <Home className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-600">{doc.property_address}</span>
                            </div>
                          )}
                          {doc.company_name && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-600">{doc.company_name}</span>
                            </div>
                          )}
                          {!doc.job_number && !doc.property_address && !doc.company_name && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleVisibility(doc)}
                          className={`flex items-center gap-1 text-sm ${
                            doc.is_customer_visible
                              ? 'text-green-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {doc.is_customer_visible ? (
                            <>
                              <Eye className="h-4 w-4" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4" />
                              Hidden
                            </>
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(doc.created_at), 'd MMM yyyy')}</p>
                          {doc.uploaded_by_name && (
                            <p className="text-xs text-slate-500">by {doc.uploaded_by_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-slate-500">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} documents
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept="image/*,video/*,.pdf"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type</Label>
              <Select
                value={uploadForm.document_type}
                onValueChange={(value) => setUploadForm({ ...uploadForm, document_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_id">Link to Job</Label>
                <Select
                  value={uploadForm.job_id || 'none'}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, job_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.job_number} - {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_id">Link to Property</Label>
                <Select
                  value={uploadForm.property_id || 'none'}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, property_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {properties.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.address_line1}, {prop.postcode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_customer_visible"
                checked={uploadForm.is_customer_visible}
                onCheckedChange={(checked) =>
                  setUploadForm({ ...uploadForm, is_customer_visible: checked === true })
                }
              />
              <Label htmlFor="is_customer_visible" className="text-sm font-normal">
                Visible to business customers
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

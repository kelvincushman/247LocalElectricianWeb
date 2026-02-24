import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
  MessageSquare,
  ArrowLeft,
  Briefcase,
  User,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  conversation_id: string | null;
  customer_id: string | null;
  job_id: string | null;
  name: string;
  email: string | null;
  phone: string;
  postcode: string | null;
  service_type: string | null;
  description: string | null;
  urgency: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  status: string;
  notes: string | null;
  source: string;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  lost: 'bg-red-100 text-red-800',
};

const urgencyColors: Record<string, string> = {
  emergency: 'bg-red-100 text-red-800',
  urgent: 'bg-orange-100 text-orange-800',
  normal: 'bg-slate-100 text-slate-800',
  flexible: 'bg-green-100 text-green-800',
};

export default function LeadsList() {
  const { isStaff } = usePortalAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Convert dialog state
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLimit = parseInt(searchParams.get('limit') || '20', 10);

  useEffect(() => {
    fetchLeads();
  }, [currentPage, currentLimit, searchParams.get('search'), searchParams.get('status')]);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
      });

      const search = searchParams.get('search');
      if (search) {
        params.append('search', search);
      }

      const status = searchParams.get('status');
      if (status && status !== 'all') {
        params.append('status', status);
      }

      const response = await fetch(`/api/portal/chatbot/leads?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    const params = new URLSearchParams(searchParams);
    if (newStatus && newStatus !== 'all') {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('limit', newLimit);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/portal/chatbot/leads/${leadId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      toast.success('Lead status updated');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to update lead status');
    }
  };

  const handleConvertLead = async () => {
    if (!selectedLead) return;

    setIsConverting(true);
    try {
      const response = await fetch(`/api/portal/chatbot/leads/${selectedLead.id}/convert`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to convert lead');
      }

      const data = await response.json();
      toast.success('Lead converted to customer and job');
      setConvertDialogOpen(false);
      setSelectedLead(null);
      fetchLeads();

      // Optionally navigate to the new customer or job
      // navigate(`/portal/customers/${data.customer_id}`);
    } catch (err) {
      toast.error('Failed to convert lead');
    } finally {
      setIsConverting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/portal/chatbot/conversations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chatbot Leads</h1>
            <p className="text-slate-500">Manage leads captured from the AI chatbot</p>
          </div>
        </div>
        <Button onClick={fetchLeads} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by name, email, phone, or postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {pagination.total} Lead{pagination.total !== 1 ? 's' : ''}
          </CardTitle>
          <Select value={currentLimit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
              <Button onClick={fetchLeads} variant="outline" className="mt-4">
                Retry
              </Button>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leads found</p>
              {(searchParams.get('search') || searchParams.get('status')) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-slate-900 flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              {lead.name}
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-sm text-slate-500">
                                <Phone className="h-3 w-3" />
                                <a href={`tel:${lead.phone}`} className="hover:text-primary">
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm text-slate-500">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${lead.email}`} className="hover:text-primary">
                                  {lead.email}
                                </a>
                              </div>
                            )}
                            {lead.postcode && (
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {lead.postcode}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{lead.service_type || 'Not specified'}</p>
                            {lead.description && (
                              <p className="text-slate-500 text-xs line-clamp-2">{lead.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.urgency && (
                            <Badge className={urgencyColors[lead.urgency] || urgencyColors.normal}>
                              {lead.urgency}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => handleUpdateStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <Badge className={statusColors[lead.status] || statusColors.new}>
                                {lead.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="h-3 w-3" />
                            {formatDate(lead.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {lead.conversation_id && (
                              <Link to={`/portal/chatbot/conversations/${lead.conversation_id}`}>
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {!lead.customer_id && lead.status !== 'converted' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setConvertDialogOpen(true);
                                }}
                              >
                                <Briefcase className="h-4 w-4 mr-1" />
                                Convert
                              </Button>
                            )}
                            {lead.customer_id && (
                              <Link to={`/portal/customers/${lead.customer_id}`}>
                                <Button variant="ghost" size="sm">
                                  <User className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * currentLimit + 1} to{' '}
                    {Math.min(currentPage * currentLimit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Convert Lead Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead to Customer</DialogTitle>
            <DialogDescription>
              This will create a new customer record and optionally a job from this lead.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Name:</span>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Phone:</span>
                  <p className="font-medium">{selectedLead.phone}</p>
                </div>
                {selectedLead.email && (
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                )}
                {selectedLead.postcode && (
                  <div>
                    <span className="text-slate-500">Postcode:</span>
                    <p className="font-medium">{selectedLead.postcode}</p>
                  </div>
                )}
                {selectedLead.service_type && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Service Requested:</span>
                    <p className="font-medium">{selectedLead.service_type}</p>
                  </div>
                )}
                {selectedLead.description && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Description:</span>
                    <p className="font-medium">{selectedLead.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvertLead} disabled={isConverting}>
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Create Customer & Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wrench,
  MapPin,
  User,
  Building2,
  Home,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Package,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface Job {
  id: string;
  job_number: string;
  title: string;
  description: string | null;
  job_type: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  scheduled_date: string | null;
  scheduled_time_start: string | null;
  scheduled_time_end: string | null;
  completed_date: string | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  estimated_cost: string | null;
  actual_cost: string | null;
  labour_cost: string | null;
  materials_cost: string | null;
  notes: string | null;
  internal_notes: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  company_id: string | null;
  company_name: string | null;
  property_id: string | null;
  property_address: string | null;
  property_address2: string | null;
  property_city: string | null;
  property_postcode: string | null;
  created_at: string;
  updated_at: string;
}

interface JobNote {
  id: string;
  note_type: string;
  content: string;
  created_by_name: string | null;
  created_at: string;
}

interface JobMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  unit_cost: string | null;
  total_cost: string | null;
}

const statusOptions = [
  { value: 'quoted', label: 'Quoted' },
  { value: 'booked', label: 'Booked' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColors: Record<string, string> = {
  quoted: 'bg-yellow-100 text-yellow-800',
  booked: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  invoiced: 'bg-orange-100 text-orange-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [materials, setMaterials] = useState<JobMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portal/jobs/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Job not found');
        }
        throw new Error('Failed to fetch job');
      }

      const data = await response.json();
      setJob(data.job);
      setNotes(data.notes || []);
      setMaterials(data.materials || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;
    setIsUpdatingStatus(true);

    try {
      const response = await fetch(`/api/portal/jobs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setJob({ ...job, status: newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);

    try {
      const response = await fetch(`/api/portal/jobs/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newNote, note_type: 'general' }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const data = await response.json();
      setNotes([data.note, ...notes]);
      setNewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/portal/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      navigate('/portal/jobs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    return timeString.slice(0, 5);
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-slate-600 mb-4">{error || 'Job not found'}</p>
        <Link to="/portal/jobs">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/portal/jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{job.job_number}</h1>
              <Badge className={statusColors[job.status] || 'bg-slate-100'}>
                {job.status.replace('_', ' ')}
              </Badge>
              {job.priority !== 'normal' && (
                <Badge className={priorityColors[job.priority] || ''} variant="outline">
                  {job.priority}
                </Badge>
              )}
            </div>
            <p className="text-slate-500">{job.title}</p>
          </div>
        </div>
        {isStaff && (
          <div className="flex gap-2">
            <Select
              value={job.status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to={`/portal/jobs/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Job</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete job {job.job_number}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Job Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.description && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-slate-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {job.job_type && (
                <div>
                  <p className="text-sm text-slate-500">Job Type</p>
                  <p className="text-slate-700">{job.job_type}</p>
                </div>
              )}
              {job.assigned_to && (
                <div>
                  <p className="text-sm text-slate-500">Assigned To</p>
                  <p className="text-slate-700">{job.assigned_to}</p>
                </div>
              )}
            </div>

            {/* Schedule */}
            {(job.scheduled_date || job.completed_date) && (
              <div className="pt-4 border-t">
                <div className="grid gap-4 sm:grid-cols-2">
                  {job.scheduled_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Scheduled</p>
                        <p className="text-slate-700">
                          {formatDate(job.scheduled_date)}
                          {job.scheduled_time_start && (
                            <span className="text-slate-500">
                              {' '}at {formatTime(job.scheduled_time_start)}
                              {job.scheduled_time_end && ` - ${formatTime(job.scheduled_time_end)}`}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {job.completed_date && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="text-slate-700">{formatDate(job.completed_date)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Duration */}
            {(job.estimated_duration || job.actual_duration) && (
              <div className="pt-4 border-t">
                <div className="grid gap-4 sm:grid-cols-2">
                  {job.estimated_duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Estimated Duration</p>
                        <p className="text-slate-700">{job.estimated_duration} hours</p>
                      </div>
                    </div>
                  )}
                  {job.actual_duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Actual Duration</p>
                        <p className="text-slate-700">{job.actual_duration} hours</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer/Property Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer & Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.customer_name && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Customer</p>
                  <Link
                    to={`/portal/customers/${job.customer_id}`}
                    className="text-primary hover:underline"
                  >
                    {job.customer_name}
                  </Link>
                </div>
              </div>
            )}

            {job.company_name && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Company</p>
                  <Link
                    to={`/portal/companies/${job.company_id}`}
                    className="text-primary hover:underline"
                  >
                    {job.company_name}
                  </Link>
                </div>
              </div>
            )}

            {job.property_address && (
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Property</p>
                  <Link
                    to={`/portal/properties/${job.property_id}`}
                    className="text-primary hover:underline"
                  >
                    {[
                      job.property_address,
                      job.property_address2,
                      job.property_city,
                      job.property_postcode
                    ].filter(Boolean).join(', ')}
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Costs */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Estimated</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(job.estimated_cost) || '-'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Labour</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(job.labour_cost) || '-'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Materials</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(job.materials_cost) || '-'}
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-slate-500">Actual Total</p>
                <p className="text-xl font-semibold text-primary">
                  {formatCurrency(job.actual_cost) || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Materials
              </CardTitle>
              <CardDescription>{materials.length} materials used</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No materials recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Material</th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-slate-500">Qty</th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-slate-500">Unit Cost</th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr key={material.id} className="border-b last:border-0">
                        <td className="py-2 px-4 text-slate-700">{material.name}</td>
                        <td className="py-2 px-4 text-right text-slate-700">
                          {material.quantity} {material.unit}
                        </td>
                        <td className="py-2 px-4 text-right text-slate-700">
                          {formatCurrency(material.unit_cost)}
                        </td>
                        <td className="py-2 px-4 text-right font-medium text-slate-900">
                          {formatCurrency(material.total_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes/Timeline */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Activity & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Note */}
            {isStaff && (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-20"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  className="self-end"
                >
                  {isAddingNote ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Notes List */}
            {notes.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No notes yet</p>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {note.created_by_name || 'System'}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(note.created_at).toLocaleString('en-GB')}
                      </span>
                    </div>
                    <p className="text-slate-600 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Internal Notes */}
        {isStaff && job.internal_notes && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Internal Notes
              </CardTitle>
              <CardDescription>Staff only - not visible to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 whitespace-pre-wrap">{job.internal_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

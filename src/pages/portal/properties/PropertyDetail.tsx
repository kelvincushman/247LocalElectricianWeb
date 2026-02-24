import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Home,
  MapPin,
  User,
  Building2,
  Briefcase,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  FileText,
  Calendar,
  Key,
} from 'lucide-react';

interface Property {
  id: string;
  address_line1: string;
  address_line2: string | null;
  city: string | null;
  county: string | null;
  postcode: string;
  property_type: string;
  customer_id: string | null;
  customer_name: string | null;
  company_id: string | null;
  company_name: string | null;
  access_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Job {
  id: string;
  job_number: string;
  title: string;
  status: string;
  scheduled_date: string | null;
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  file_path: string;
  created_at: string;
}

const propertyTypeLabels: Record<string, string> = {
  house: 'House',
  flat: 'Flat',
  bungalow: 'Bungalow',
  maisonette: 'Maisonette',
  commercial: 'Commercial',
  hmo: 'HMO',
  other: 'Other',
};

const statusColors: Record<string, string> = {
  quoted: 'bg-yellow-100 text-yellow-800',
  booked: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  invoiced: 'bg-orange-100 text-orange-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portal/properties/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found');
        }
        throw new Error('Failed to fetch property');
      }

      const data = await response.json();
      setProperty(data.property);
      setJobs(data.jobs || []);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/portal/properties/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      navigate('/portal/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-slate-600 mb-4">{error || 'Property not found'}</p>
        <Link to="/portal/properties">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
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
          <Link to="/portal/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{property.address_line1}</h1>
              <Badge variant="outline">
                {propertyTypeLabels[property.property_type] || property.property_type}
              </Badge>
            </div>
            <p className="text-slate-500 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.city && `${property.city}, `}
              {property.postcode}
            </p>
          </div>
        </div>
        {isStaff && (
          <div className="flex gap-2">
            <Link to={`/portal/properties/${id}/edit`}>
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
                  <AlertDialogTitle>Delete Property</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {property.address_line1}? This action cannot be
                    undone.
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
        {/* Property Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Full Address</p>
                <address className="not-italic text-slate-900">
                  <div>{property.address_line1}</div>
                  {property.address_line2 && <div>{property.address_line2}</div>}
                  {property.city && <div>{property.city}</div>}
                  {property.county && <div>{property.county}</div>}
                  <div>{property.postcode}</div>
                </address>
              </div>
            </div>

            {property.customer_id && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Customer</p>
                  <Link
                    to={`/portal/customers/${property.customer_id}`}
                    className="text-primary hover:underline"
                  >
                    {property.customer_name}
                  </Link>
                </div>
              </div>
            )}

            {property.company_id && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Company</p>
                  <Link
                    to={`/portal/companies/${property.company_id}`}
                    className="text-primary hover:underline"
                  >
                    {property.company_name}
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Notes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Access Notes
            </CardTitle>
            <CardDescription>Instructions for accessing the property</CardDescription>
          </CardHeader>
          <CardContent>
            {property.access_notes ? (
              <p className="text-slate-600 whitespace-pre-wrap">{property.access_notes}</p>
            ) : (
              <p className="text-slate-400 italic">No access notes recorded</p>
            )}
          </CardContent>
        </Card>

        {/* General Notes */}
        {property.notes && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 whitespace-pre-wrap">{property.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Jobs */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Jobs
              </CardTitle>
              <CardDescription>{jobs.length} jobs at this property</CardDescription>
            </div>
            {isStaff && (
              <Link to={`/portal/jobs/new?property_id=${id}`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Job
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No jobs at this property yet</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/portal/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{job.title}</p>
                        <p className="text-sm text-slate-500">{job.job_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.scheduled_date && (
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.scheduled_date).toLocaleDateString('en-GB')}
                        </div>
                      )}
                      <Badge className={statusColors[job.status] || 'bg-slate-100 text-slate-800'}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>Certificates and documents for this property</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No documents uploaded yet</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-slate-900">{doc.title}</p>
                      <p className="text-sm text-slate-500">
                        {doc.document_type} •{' '}
                        {new Date(doc.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

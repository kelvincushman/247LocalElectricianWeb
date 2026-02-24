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
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Home,
  Briefcase,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  Percent,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  company_type: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  discount_tier: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

interface Property {
  id: string;
  address_line1: string;
  city: string | null;
  postcode: string;
}

interface Job {
  id: string;
  job_number: string;
  title: string;
  status: string;
  scheduled_date: string | null;
}

const companyTypeLabels: Record<string, string> = {
  estate_agent: 'Estate Agent',
  letting_agent: 'Letting Agent',
  property_manager: 'Property Manager',
  landlord: 'Landlord',
  housing_association: 'Housing Association',
  contractor: 'Contractor',
  other: 'Other',
};

const discountTierInfo: Record<string, { label: string; discount: string; color: string }> = {
  none: { label: 'None', discount: '0%', color: 'bg-slate-100 text-slate-700' },
  bronze: { label: 'Bronze', discount: '5%', color: 'bg-amber-100 text-amber-800' },
  silver: { label: 'Silver', discount: '10%', color: 'bg-slate-200 text-slate-700' },
  gold: { label: 'Gold', discount: '15%', color: 'bg-yellow-100 text-yellow-800' },
  platinum: { label: 'Platinum', discount: '20%', color: 'bg-purple-100 text-purple-800' },
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

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = usePortalAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portal/companies/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Company not found');
        }
        throw new Error('Failed to fetch company');
      }

      const data = await response.json();
      setCompany(data.company);
      setContacts(data.contacts || []);
      setProperties(data.properties || []);
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/portal/companies/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      navigate('/portal/companies');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setIsDeleting(false);
    }
  };

  if (!isStaff) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-slate-600 mb-4">{error || 'Company not found'}</p>
        <Link to="/portal/companies">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
      </div>
    );
  }

  const tierInfo = discountTierInfo[company.discount_tier] || discountTierInfo.none;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/portal/companies">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
              {!company.is_active && (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                {companyTypeLabels[company.company_type] || company.company_type}
              </Badge>
              <Badge className={tierInfo.color}>
                {tierInfo.label} ({tierInfo.discount} discount)
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/portal/companies/${id}/edit`}>
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
                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {company.name}? This action cannot be undone.
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                    {company.email}
                  </a>
                </div>
              </div>
            )}

            {company.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                    {company.phone}
                  </a>
                </div>
              </div>
            )}

            {company.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Website</p>
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}

            {(company.address_line1 || company.postcode) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <address className="not-italic text-slate-900">
                    {company.address_line1 && <div>{company.address_line1}</div>}
                    {company.address_line2 && <div>{company.address_line2}</div>}
                    {company.city && <div>{company.city}</div>}
                    {company.county && <div>{company.county}</div>}
                    {company.postcode && <div>{company.postcode}</div>}
                  </address>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Percent className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Discount Tier</p>
                <p className="text-slate-900">
                  {tierInfo.label} - {tierInfo.discount} off all services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contacts
              </CardTitle>
              <CardDescription>{contacts.length} people</CardDescription>
            </div>
            <Link to={`/portal/customers/new?company_id=${id}`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No contacts linked</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/portal/customers/${contact.id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.email && (
                          <p className="text-sm text-slate-500">{contact.email}</p>
                        )}
                      </div>
                    </div>
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary hover:underline"
                      >
                        {contact.phone}
                      </a>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {company.notes && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 whitespace-pre-wrap">{company.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Properties */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Properties
              </CardTitle>
              <CardDescription>{properties.length} linked properties</CardDescription>
            </div>
            <Link to={`/portal/properties/new?company_id=${id}`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No properties linked</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/portal/properties/${property.id}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Home className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">{property.address_line1}</p>
                      <p className="text-sm text-slate-500">
                        {property.city && `${property.city}, `}
                        {property.postcode}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recent Jobs
              </CardTitle>
              <CardDescription>{jobs.length} jobs</CardDescription>
            </div>
            <Link to={`/portal/jobs/new?company_id=${id}`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Job
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No jobs yet</p>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 10).map((job) => (
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
                    <Badge className={statusColors[job.status] || 'bg-slate-100 text-slate-800'}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

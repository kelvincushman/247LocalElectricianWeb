import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Briefcase,
  FileText,
  ArrowRight,
  Loader2,
  Home,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  properties: number;
  jobs: {
    total: number;
    active: number;
    completed: number;
  };
  documents: number;
  recentJobs: Array<{
    id: string;
    job_number: string;
    title: string;
    status: string;
    created_at: string;
    property_address: string;
    property_postcode: string;
  }>;
  recentDocuments: Array<{
    id: string;
    file_name: string;
    document_type: string;
    created_at: string;
    job_number: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  quoted: 'bg-purple-100 text-purple-800',
  booked: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  invoiced: 'bg-cyan-100 text-cyan-800',
  paid: 'bg-emerald-100 text-emerald-800',
};

export default function BusinessDashboard() {
  const { user } = usePortalAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/portal/my/dashboard', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.company_name || user?.full_name}</h1>
          <p className="text-slate-500">View your properties, jobs, and documents</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Properties</CardTitle>
            <Home className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.properties || 0}</div>
            <Link to="/portal/my-properties" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.jobs?.total || 0}</div>
            <div className="flex gap-4 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats?.jobs?.active || 0} active
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {stats?.jobs?.completed || 0} completed
              </span>
            </div>
            <Link to="/portal/my-jobs" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Documents</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.documents || 0}</div>
            <Link to="/portal/my-documents" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs & Documents */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Recent Jobs
                </CardTitle>
                <CardDescription>Latest job activity</CardDescription>
              </div>
              <Link to="/portal/my-jobs">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentJobs?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No jobs yet</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentJobs?.map((job) => (
                  <Link
                    key={job.id}
                    to={`/portal/my-jobs/${job.id}`}
                    className="block p-3 rounded-lg border hover:border-primary/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{job.title}</p>
                        <p className="text-sm text-slate-500">
                          {job.job_number} • {job.property_address}, {job.property_postcode}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[job.status] || 'bg-slate-100 text-slate-800'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Documents
                </CardTitle>
                <CardDescription>Latest uploaded documents</CardDescription>
              </div>
              <Link to="/portal/my-documents">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentDocuments?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No documents yet</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentDocuments?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded">
                        <FileText className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{doc.file_name}</p>
                        <p className="text-xs text-slate-500">
                          {doc.document_type} {doc.job_number && `• ${doc.job_number}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {format(new Date(doc.created_at), 'd MMM yyyy')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            If you have any questions about your properties or jobs, please don't hesitate to contact us:
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <a href="tel:08001234567" className="text-primary hover:underline font-medium">
              📞 0800 123 4567
            </a>
            <a href="mailto:info@247electrician.uk" className="text-primary hover:underline font-medium">
              ✉️ info@247electrician.uk
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Users,
  Building2,
  Receipt,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface DashboardStats {
  jobs_by_status: Record<string, number>;
  recent_jobs: Array<{
    id: string;
    job_number: string;
    title: string;
    status: string;
    customer_name: string;
    scheduled_date: string | null;
  }>;
  today_schedule: Array<{
    id: string;
    title: string;
    start_time: string;
    assigned_to: string;
    job_title: string | null;
  }>;
  unpaid_invoices: { count: number; total: number };
  pending_quotes: number;
  total_customers: number;
  total_companies: number;
}

const statusColors: Record<string, string> = {
  quoted: 'bg-yellow-100 text-yellow-800',
  booked: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  invoiced: 'bg-orange-100 text-orange-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const { user, isStaff, isBusinessCustomer } = usePortalAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isStaff) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/portal/dashboard/stats', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Failed to load dashboard stats');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isStaff]);

  // Business Customer Dashboard
  if (isBusinessCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.display_name}</h1>
            <p className="text-slate-500">
              {user?.company_name && `${user.company_name} - `}Business Customer Portal
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/portal/my-properties">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">My Properties</CardTitle>
                <Building2 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">View your managed properties</p>
                <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/portal/my-jobs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">My Jobs</CardTitle>
                <Briefcase className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">Track job progress and status</p>
                <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/portal/my-documents">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">My Documents</CardTitle>
                <FileText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">Access certificates, EICRs, and more</p>
                <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact 247Electrician for any enquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:01902943929" className="flex-1">
                <Button variant="outline" className="w-full">
                  Call: 01902 943 929
                </Button>
              </a>
              <a href="mailto:info@247electrician.uk" className="flex-1">
                <Button variant="outline" className="w-full">
                  Email Us
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Staff Dashboard
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const totalJobs = stats?.jobs_by_status
    ? Object.values(stats.jobs_by_status).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.display_name}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/portal/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </Link>
          <Link to="/portal/customers/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Jobs</CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-slate-500">
              {stats?.jobs_by_status?.in_progress || 0} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Customers</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_customers || 0}</div>
            <p className="text-xs text-slate-500">{stats?.total_companies || 0} companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Quotes</CardTitle>
            <FileText className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_quotes || 0}</div>
            <p className="text-xs text-slate-500">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Unpaid Invoices</CardTitle>
            <Receipt className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unpaid_invoices?.count || 0}</div>
            <p className="text-xs text-slate-500">
              £{(stats?.unpaid_invoices?.total || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })} outstanding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Appointments for today</CardDescription>
            </div>
            <Link to="/portal/calendar">
              <Button variant="ghost" size="sm">
                View Calendar <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats?.today_schedule && stats.today_schedule.length > 0 ? (
              <div className="space-y-4">
                {stats.today_schedule.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {entry.job_title || entry.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {entry.start_time ? entry.start_time.slice(0, 5) : 'All day'} •{' '}
                        {entry.assigned_to || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Latest job activity</CardDescription>
            </div>
            <Link to="/portal/jobs">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats?.recent_jobs && stats.recent_jobs.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_jobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/portal/jobs/${job.id}`}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 truncate">{job.title}</p>
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                            statusColors[job.status] || 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {job.job_number} • {job.customer_name || 'No customer'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No jobs yet</p>
                <Link to="/portal/jobs/new">
                  <Button variant="link" className="mt-2">
                    Create your first job
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Status Overview */}
      {stats?.jobs_by_status && Object.keys(stats.jobs_by_status).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Status Overview</CardTitle>
            <CardDescription>Current status of all jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Object.entries(stats.jobs_by_status).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-sm text-slate-500 capitalize">{status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/portal/jobs/new">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Plus className="h-5 w-5" />
                <span>New Job</span>
              </Button>
            </Link>
            <Link to="/portal/customers/new">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>New Customer</span>
              </Button>
            </Link>
            <Link to="/portal/quotes/new">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>New Quote</span>
              </Button>
            </Link>
            <Link to="/portal/calendar">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Calendar className="h-5 w-5" />
                <span>Calendar</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

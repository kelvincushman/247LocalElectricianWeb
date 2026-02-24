import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

interface Job {
  id: string;
  job_number: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  estimated_duration: string | null;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  property_address: string;
  property_address2: string | null;
  property_city: string;
  property_postcode: string;
}

interface Note {
  id: string;
  content: string;
  note_type: string;
  author_name: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  quoted: 'bg-purple-100 text-purple-800 border-purple-200',
  booked: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  invoiced: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function MyJobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/portal/my/jobs/${id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
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

  if (!job) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">Job not found</p>
        <Link to="/portal/my-jobs" className="text-primary hover:underline mt-2 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/portal/my-jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <span className={`text-sm px-3 py-1 rounded-full border ${STATUS_COLORS[job.status] || 'bg-slate-100 text-slate-800'}`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500 font-mono">{job.job_number}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.description && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Description</p>
                  <p className="mt-1">{job.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Priority</p>
                  <p className="mt-1 capitalize">{job.priority || 'Normal'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Created</p>
                  <p className="mt-1">{format(new Date(job.created_at), 'd MMMM yyyy')}</p>
                </div>
              </div>

              {job.scheduled_date && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-800 font-medium">
                    <Calendar className="h-4 w-4" />
                    Scheduled
                  </div>
                  <p className="mt-1 text-blue-900">
                    {format(new Date(job.scheduled_date), 'EEEE, d MMMM yyyy')}
                    {job.scheduled_time && ` at ${job.scheduled_time.substring(0, 5)}`}
                  </p>
                  {job.estimated_duration && (
                    <p className="text-sm text-blue-700 mt-1">
                      Estimated duration: {job.estimated_duration}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Updates
              </CardTitle>
              <CardDescription>
                Notes and updates about this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No updates yet</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{note.author_name || 'Staff'}</span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(note.created_at), 'd MMM yyyy, HH:mm')}
                        </span>
                      </div>
                      <p className="text-slate-600">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{job.property_address}</p>
              {job.property_address2 && <p className="text-slate-600">{job.property_address2}</p>}
              <p className="text-slate-600">{job.property_city}</p>
              <p className="font-mono text-sm">{job.property_postcode}</p>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['quoted', 'booked', 'in_progress', 'completed', 'invoiced', 'paid'].map((status, idx) => {
                  const statusOrder = ['quoted', 'booked', 'in_progress', 'completed', 'invoiced', 'paid'];
                  const currentIdx = statusOrder.indexOf(job.status);
                  const isActive = idx <= currentIdx;

                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-200'}`} />
                      <span className={`text-sm capitalize ${isActive ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

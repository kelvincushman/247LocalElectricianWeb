import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  RefreshCw,
  Settings,
  Briefcase,
  Clock,
  User,
  Trash2,
  Edit,
  X,
  MapPin,
  Phone,
  ExternalLink,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  getDay,
  setHours,
  setMinutes,
} from 'date-fns';

interface ScheduleEntry {
  id: string;
  job_id: string | null;
  title: string;
  description: string | null;
  entry_type: string;
  assigned_to: string | null;
  start_date: string;
  start_time: string | null;
  end_date: string;
  end_time: string | null;
  all_day: boolean;
  color: string | null;
  job_number?: string;
  job_title?: string;
  job_time_start?: string;
  job_time_end?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  property_address?: string;
  property_address2?: string;
  property_city?: string;
  property_postcode?: string;
  google_event_id?: string;
  sync_status?: string;
}

interface Job {
  id: string;
  job_number: string;
  title: string;
}

type ViewType = 'month' | 'week' | 'day';

const ENTRY_COLORS = {
  job: '#3b82f6', // blue
  appointment: '#22c55e', // green
  holiday: '#ef4444', // red
  training: '#f59e0b', // amber
  other: '#8b5cf6', // purple
};

const ASSIGNEES = ['Kelvin', 'Andy', 'Both'];

export default function CalendarView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // Form state for new/edit entry
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    entry_type: 'appointment',
    assigned_to: '',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    end_time: '10:00',
    all_day: false,
    job_id: '',
    color: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchJobs();
  }, [currentDate, viewType]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      let startDate: Date, endDate: Date;

      if (viewType === 'month') {
        startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      } else if (viewType === 'week') {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        startDate = currentDate;
        endDate = currentDate;
      }

      const params = new URLSearchParams({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });

      const response = await fetch(`/api/portal/schedule?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch calendar entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/portal/jobs?status=booked,in_progress&limit=100', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const handlePrev = () => {
    if (viewType === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewType === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEntry(null);
    setFormData({
      title: '',
      description: '',
      entry_type: 'appointment',
      assigned_to: '',
      start_date: format(date, 'yyyy-MM-dd'),
      start_time: '09:00',
      end_date: format(date, 'yyyy-MM-dd'),
      end_time: '10:00',
      all_day: false,
      job_id: '',
      color: '',
    });
    setShowEntryDialog(true);
  };

  const handleEntryClick = (entry: ScheduleEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEntry(entry);
    setSelectedDate(null);
    setFormData({
      title: entry.title,
      description: entry.description || '',
      entry_type: entry.entry_type,
      assigned_to: entry.assigned_to || '',
      start_date: entry.start_date.substring(0, 10), // Normalize ISO date
      start_time: entry.start_time?.substring(0, 5) || '09:00', // Normalize time format HH:MM
      end_date: entry.end_date.substring(0, 10), // Normalize ISO date
      end_time: entry.end_time?.substring(0, 5) || '10:00', // Normalize time format HH:MM
      all_day: entry.all_day,
      job_id: entry.job_id || '',
      color: entry.color || '',
    });
    setShowEntryDialog(true);
  };

  const handleSaveEntry = async () => {
    setIsSaving(true);
    try {
      const url = selectedEntry
        ? `/api/portal/schedule/${selectedEntry.id}`
        : '/api/portal/schedule';
      const method = selectedEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEntryDialog(false);
        fetchEntries();
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/portal/schedule/${selectedEntry.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setShowEntryDialog(false);
        fetchEntries();
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/portal/calendar/google/sync', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        fetchEntries();
        alert(`Sync complete: ${data.message}`);
      } else if (response.status === 401 && data.needsAuth) {
        // Need to authorize Google Calendar
        if (confirm('Google Calendar not connected. Would you like to connect now?')) {
          window.location.href = '/api/portal/calendar/google/auth';
        }
      } else {
        alert(data.error || 'Failed to sync');
      }
    } catch (error) {
      console.error('Failed to sync with Google Calendar:', error);
      alert('Failed to sync with Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter entries by assignee
  const filteredEntries = useMemo(() => {
    if (filterAssignee === 'all') return entries;
    return entries.filter(
      (e) => e.assigned_to === filterAssignee || e.assigned_to === 'Both'
    );
  }, [entries, filterAssignee]);

  // Get entries for a specific date
  const getEntriesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEntries.filter((entry) => {
      // Normalize dates from API (could be ISO string "2025-12-19T00:00:00.000Z" or just "2025-12-19")
      const startDate = entry.start_date.substring(0, 10);
      const endDate = entry.end_date.substring(0, 10);
      return startDate <= dateStr && endDate >= dateStr;
    });
  };

  // Generate calendar grid for month view
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;

    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Generate week days for week view
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Time slots for week/day view
  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  }, []);

  const getEntryColor = (entry: ScheduleEntry) => {
    if (entry.color) return entry.color;
    return ENTRY_COLORS[entry.entry_type as keyof typeof ENTRY_COLORS] || ENTRY_COLORS.other;
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
        <div
          key={day}
          className="bg-slate-50 py-2 text-center text-sm font-medium text-slate-600"
        >
          {day}
        </div>
      ))}

      {/* Days */}
      {monthDays.map((day, idx) => {
        const dayEntries = getEntriesForDate(day);
        const isCurrentMonth = isSameMonth(day, currentDate);

        return (
          <div
            key={idx}
            onClick={() => handleDateClick(day)}
            className={`bg-white min-h-[100px] p-1 cursor-pointer hover:bg-slate-50 transition-colors ${
              !isCurrentMonth ? 'bg-slate-50/50' : ''
            }`}
          >
            <div
              className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                isToday(day)
                  ? 'bg-primary text-white'
                  : isCurrentMonth
                  ? 'text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEntries.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  onClick={(e) => handleEntryClick(entry, e)}
                  className="text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: getEntryColor(entry) }}
                  title={entry.title}
                >
                  {entry.all_day ? '' : entry.start_time?.substring(0, 5) + ' '}
                  {entry.title}
                </div>
              ))}
              {dayEntries.length > 3 && (
                <div className="text-xs text-slate-500 px-1">
                  +{dayEntries.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="flex flex-col">
      {/* Header with day names and dates */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 border-r"></div>
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={`p-2 text-center border-r ${isToday(day) ? 'bg-primary/10' : ''}`}
          >
            <div className="text-sm font-medium text-slate-600">
              {format(day, 'EEE')}
            </div>
            <div
              className={`text-lg font-bold ${
                isToday(day) ? 'text-primary' : 'text-slate-900'
              }`}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events */}
      <div className="grid grid-cols-8 border-b bg-slate-50">
        <div className="p-2 border-r text-xs text-slate-500">All day</div>
        {weekDays.map((day, idx) => {
          const dayEntries = getEntriesForDate(day).filter((e) => e.all_day);
          return (
            <div key={idx} className="p-1 border-r min-h-[40px]">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={(e) => handleEntryClick(entry, e)}
                  className="text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 mb-1"
                  style={{ backgroundColor: getEntryColor(entry) }}
                >
                  {entry.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[600px]">
        {timeSlots.map((time, timeIdx) => (
          <div key={time} className="grid grid-cols-8 border-b">
            <div className="p-2 border-r text-xs text-slate-500 text-right">
              {time}
            </div>
            {weekDays.map((day, dayIdx) => {
              const dayEntries = getEntriesForDate(day).filter((e) => {
                if (e.all_day) return false;
                const entryHour = parseInt(e.start_time?.slice(0, 2) || '0');
                return entryHour === timeIdx;
              });

              return (
                <div
                  key={dayIdx}
                  onClick={() => {
                    const clickedDate = setMinutes(setHours(day, timeIdx), 0);
                    handleDateClick(clickedDate);
                  }}
                  className="p-1 border-r min-h-[50px] hover:bg-slate-50 cursor-pointer relative"
                >
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={(e) => handleEntryClick(entry, e)}
                      className="text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 mb-1"
                      style={{ backgroundColor: getEntryColor(entry) }}
                    >
                      {entry.start_time?.slice(0, 5)} {entry.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayEntries = getEntriesForDate(currentDate);
    const allDayEntries = dayEntries.filter((e) => e.all_day);
    const timedEntries = dayEntries.filter((e) => !e.all_day);

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="p-4 border-b text-center">
          <div className="text-lg font-bold text-slate-900">
            {format(currentDate, 'EEEE, d MMMM yyyy')}
          </div>
        </div>

        {/* All-day events */}
        {allDayEntries.length > 0 && (
          <div className="p-2 border-b bg-slate-50">
            <div className="text-xs text-slate-500 mb-1">All day</div>
            {allDayEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={(e) => handleEntryClick(entry, e)}
                className="text-sm px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 mb-1"
                style={{ backgroundColor: getEntryColor(entry) }}
              >
                {entry.title}
              </div>
            ))}
          </div>
        )}

        {/* Time grid */}
        <div className="overflow-y-auto max-h-[600px]">
          {timeSlots.map((time, timeIdx) => {
            const hourEntries = timedEntries.filter((e) => {
              const entryHour = parseInt(e.start_time?.slice(0, 2) || '0');
              return entryHour === timeIdx;
            });

            return (
              <div key={time} className="flex border-b">
                <div className="w-20 p-2 text-sm text-slate-500 text-right border-r">
                  {time}
                </div>
                <div
                  onClick={() => {
                    const clickedDate = setMinutes(setHours(currentDate, timeIdx), 0);
                    handleDateClick(clickedDate);
                  }}
                  className="flex-1 p-2 min-h-[60px] hover:bg-slate-50 cursor-pointer"
                >
                  {hourEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={(e) => handleEntryClick(entry, e)}
                      className="text-sm px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 mb-1"
                      style={{ backgroundColor: getEntryColor(entry) }}
                    >
                      <div className="font-medium">{entry.title}</div>
                      <div className="text-xs opacity-80">
                        {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                        {entry.assigned_to && ` | ${entry.assigned_to}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-500">Manage schedules for Kelvin & Andy</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGoogleSync} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Google
          </Button>
          <Button onClick={() => handleDateClick(new Date())}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold ml-2">
                {viewType === 'month' && format(currentDate, 'MMMM yyyy')}
                {viewType === 'week' &&
                  `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM')} - ${format(
                    endOfWeek(currentDate, { weekStartsOn: 1 }),
                    'd MMM yyyy'
                  )}`}
                {viewType === 'day' && format(currentDate, 'EEEE, d MMMM yyyy')}
              </h2>
            </div>

            {/* View & Filter Controls */}
            <div className="flex items-center gap-2">
              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="w-32">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Kelvin">Kelvin</SelectItem>
                  <SelectItem value="Andy">Andy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {viewType === 'month' && renderMonthView()}
              {viewType === 'week' && renderWeekView()}
              {viewType === 'day' && renderDayView()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Legend:</span>
            {Object.entries(ENTRY_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm capitalize">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry ? 'Edit Entry' : 'New Calendar Entry'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Show job/customer details when editing an existing entry with a linked job */}
            {selectedEntry && selectedEntry.job_id && (
              <div className="bg-slate-50 rounded-lg p-3 space-y-2 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {selectedEntry.job_number && `Job: ${selectedEntry.job_number}`}
                  </span>
                  <a
                    href={`/portal/jobs/${selectedEntry.job_id}`}
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    View Job <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {selectedEntry.customer_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4" />
                    <span>{selectedEntry.customer_name}</span>
                    {selectedEntry.customer_phone && (
                      <a href={`tel:${selectedEntry.customer_phone}`} className="text-primary hover:underline flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedEntry.customer_phone}
                      </a>
                    )}
                  </div>
                )}
                {selectedEntry.property_address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>
                      {[
                        selectedEntry.property_address,
                        selectedEntry.property_address2,
                        selectedEntry.property_city,
                        selectedEntry.property_postcode
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {(selectedEntry.job_time_start || selectedEntry.start_time) && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {selectedEntry.start_time?.substring(0, 5) || selectedEntry.job_time_start?.substring(0, 5)}
                      {(selectedEntry.end_time || selectedEntry.job_time_end) &&
                        ` - ${selectedEntry.end_time?.substring(0, 5) || selectedEntry.job_time_end?.substring(0, 5)}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Entry title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry_type">Type</Label>
                <Select
                  value={formData.entry_type}
                  onValueChange={(v) => setFormData({ ...formData, entry_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.entry_type === 'job' && (
              <div>
                <Label htmlFor="job_id">Link to Job</Label>
                <Select
                  value={formData.job_id}
                  onValueChange={(v) => setFormData({ ...formData, job_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.job_number} - {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="all_day"
                checked={formData.all_day}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, all_day: checked as boolean })
                }
              />
              <Label htmlFor="all_day">All day event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              {!formData.all_day && (
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              {!formData.all_day && (
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-4">
              {selectedEntry && (
                <Button variant="destructive" onClick={handleDeleteEntry}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => setShowEntryDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEntry} disabled={isSaving || !formData.title}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedEntry ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

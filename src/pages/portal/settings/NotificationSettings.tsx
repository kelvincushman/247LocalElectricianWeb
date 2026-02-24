import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationSettings, updateNotificationSettings } from '@/services/certificateService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Mail,
  Smartphone,
  FileCheck,
  ClipboardCheck,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { useState, useEffect } from 'react';

interface NotificationSettingsData {
  email_certificate_submitted: boolean;
  email_certificate_approved: boolean;
  email_certificate_rejected: boolean;
  email_new_request: boolean;
  sms_certificate_approved: boolean;
  sms_new_request: boolean;
}

export default function NotificationSettings() {
  const { isStaff, canApprove } = usePortalAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<NotificationSettingsData>({
    email_certificate_submitted: true,
    email_certificate_approved: true,
    email_certificate_rejected: true,
    email_new_request: true,
    sms_certificate_approved: false,
    sms_new_request: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: getNotificationSettings,
  });

  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      toast({
        title: 'Settings Saved',
        description: 'Your notification preferences have been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleToggle = (key: keyof NotificationSettingsData) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        Error loading notification settings
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bell className="h-7 w-7 text-primary" />
          Notification Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Configure how you receive certificate notifications
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isStaff && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Certificate Submitted</Label>
                <p className="text-sm text-slate-500">
                  Receive an email when a certificate is submitted for approval
                </p>
              </div>
              <Switch
                checked={settings.email_certificate_submitted}
                onCheckedChange={() => handleToggle('email_certificate_submitted')}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Certificate Approved</Label>
              <p className="text-sm text-slate-500">
                Receive an email when your certificate is approved
              </p>
            </div>
            <Switch
              checked={settings.email_certificate_approved}
              onCheckedChange={() => handleToggle('email_certificate_approved')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Certificate Rejected / Revision Requested</Label>
              <p className="text-sm text-slate-500">
                Receive an email when your certificate needs revision
              </p>
            </div>
            <Switch
              checked={settings.email_certificate_rejected}
              onCheckedChange={() => handleToggle('email_certificate_rejected')}
            />
          </div>

          {(isStaff || canApprove) && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">New Certificate Request</Label>
                <p className="text-sm text-slate-500">
                  Receive an email when a customer requests a certificate
                </p>
              </div>
              <Switch
                checked={settings.email_new_request}
                onCheckedChange={() => handleToggle('email_new_request')}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive text message alerts for important updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Certificate Approved</Label>
              <p className="text-sm text-slate-500">
                Get a text when your certificate is approved
              </p>
            </div>
            <Switch
              checked={settings.sms_certificate_approved}
              onCheckedChange={() => handleToggle('sms_certificate_approved')}
            />
          </div>

          {(isStaff || canApprove) && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">New Certificate Request</Label>
                <p className="text-sm text-slate-500">
                  Get a text when a customer requests a certificate
                </p>
              </div>
              <Switch
                checked={settings.sms_new_request}
                onCheckedChange={() => handleToggle('sms_new_request')}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <FileCheck className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900">Certificate Notifications</h3>
              <p className="text-sm text-blue-700 mt-1">
                These settings control notifications for electrical certificates (EICR, EIC, Minor Works).
                Email notifications are sent to your registered email address. SMS notifications
                require a valid mobile number on your profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="gap-2"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

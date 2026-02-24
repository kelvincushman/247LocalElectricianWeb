import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEngineerProfile, updateEngineerProfile } from '@/services/certificateService';
import type { EngineerProfile as EngineerProfileType } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Save,
  Loader2,
  AlertCircle,
  Award,
  FileSignature,
  Shield,
} from 'lucide-react';
import { usePortalAuth } from '@/contexts/PortalAuthContext';

export default function EngineerProfile() {
  const { user } = usePortalAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    napit_number: '',
    nic_number: '',
    signature_url: '',
    can_approve_certificates: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['engineer-profile'],
    queryFn: getEngineerProfile,
  });

  useEffect(() => {
    if (data?.profile) {
      setFormData({
        napit_number: data.profile.napit_number || '',
        nic_number: data.profile.nic_number || '',
        signature_url: data.profile.signature_url || '',
        can_approve_certificates: data.profile.can_approve_certificates || false,
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateEngineerProfile,
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your engineer profile has been saved.',
      });
      queryClient.invalidateQueries({ queryKey: ['engineer-profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
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
        Error loading engineer profile
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="h-7 w-7 text-primary" />
          Engineer Profile
        </h1>
        <p className="text-slate-500 mt-1">
          Your professional credentials for electrical certificates
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Details
          </CardTitle>
          <CardDescription>
            Your registered account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-500 text-xs">Display Name</Label>
              <div className="font-medium">{user?.display_name || '-'}</div>
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Email</Label>
              <div className="font-medium">{user?.email || '-'}</div>
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Phone</Label>
              <div className="font-medium">{user?.phone || '-'}</div>
            </div>
            <div>
              <Label className="text-slate-500 text-xs">Role</Label>
              <div className="font-medium capitalize">{user?.user_type?.replace('_', ' ') || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Professional Credentials
          </CardTitle>
          <CardDescription>
            Your registration numbers for electrical certification bodies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>NAPIT Registration Number</Label>
            <Input
              value={formData.napit_number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, napit_number: e.target.value }))
              }
              placeholder="Enter your NAPIT number"
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your NAPIT membership number will appear on certificates
            </p>
          </div>

          <div>
            <Label>NIC EIC Registration Number</Label>
            <Input
              value={formData.nic_number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nic_number: e.target.value }))
              }
              placeholder="Enter your NIC EIC number (if applicable)"
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional: Include if you are registered with NIC EIC
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Digital Signature
          </CardTitle>
          <CardDescription>
            Your signature for electronic certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Signature URL</Label>
            <Input
              value={formData.signature_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, signature_url: e.target.value }))
              }
              placeholder="URL to your signature image"
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Upload your signature image and paste the URL here
            </p>
          </div>

          {formData.signature_url && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <Label className="text-xs text-slate-500 mb-2 block">Preview</Label>
              <img
                src={formData.signature_url}
                alt="Signature preview"
                className="max-h-20 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).alt = 'Invalid image URL';
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* QS Permissions */}
      {user?.user_type === 'admin' || user?.user_type === 'super_admin' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              QS Permissions
            </CardTitle>
            <CardDescription>
              Quality Supervisor approval capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Can Approve Certificates</Label>
                <p className="text-sm text-slate-500">
                  Enable to review and approve submitted certificates
                </p>
              </div>
              <Switch
                checked={formData.can_approve_certificates}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, can_approve_certificates: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Award className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900">Certificate Requirements</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your professional credentials are required for issuing electrical certificates.
                Ensure your NAPIT registration is current and your signature is legible.
                Certificates will display your name and registration number.
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
          Save Profile
        </Button>
      </div>
    </div>
  );
}

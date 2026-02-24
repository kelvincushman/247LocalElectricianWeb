import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTestInstruments, createTestInstrument, updateTestInstrument } from '@/services/certificateService';
import type { TestInstrument } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Wrench,
  Plus,
  Edit,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INSTRUMENT_TYPES = [
  'Multifunction Tester',
  'Insulation Tester',
  'Loop Impedance Tester',
  'RCD Tester',
  'Earth Electrode Tester',
  'PAT Tester',
  'Voltage Indicator',
  'Proving Unit',
  'Clamp Meter',
  'Other',
];

export default function TestInstruments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<TestInstrument | null>(null);
  const [formData, setFormData] = useState({
    instrument_type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    calibration_date: '',
    next_calibration: '',
    is_active: true,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['test-instruments'],
    queryFn: getTestInstruments,
  });

  const createMutation = useMutation({
    mutationFn: createTestInstrument,
    onSuccess: () => {
      toast({
        title: 'Instrument Added',
        description: 'Test instrument has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['test-instruments'] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add instrument',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TestInstrument> }) =>
      updateTestInstrument(id, data),
    onSuccess: () => {
      toast({
        title: 'Instrument Updated',
        description: 'Test instrument has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['test-instruments'] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update instrument',
        variant: 'destructive',
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingInstrument(null);
    setFormData({
      instrument_type: '',
      manufacturer: '',
      model: '',
      serial_number: '',
      calibration_date: '',
      next_calibration: '',
      is_active: true,
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (instrument: TestInstrument) => {
    setEditingInstrument(instrument);
    setFormData({
      instrument_type: instrument.instrument_type || '',
      manufacturer: instrument.manufacturer || '',
      model: instrument.model || '',
      serial_number: instrument.serial_number || '',
      calibration_date: instrument.calibration_date?.split('T')[0] || '',
      next_calibration: instrument.next_calibration?.split('T')[0] || '',
      is_active: instrument.is_active ?? true,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingInstrument(null);
  };

  const handleSave = () => {
    if (editingInstrument) {
      updateMutation.mutate({
        id: editingInstrument.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isCalibrationDue = (nextCal?: string) => {
    if (!nextCal) return false;
    const nextDate = new Date(nextCal);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return nextDate <= thirtyDaysFromNow;
  };

  const isCalibrationOverdue = (nextCal?: string) => {
    if (!nextCal) return false;
    return new Date(nextCal) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-7 w-7 text-primary" />
            Test Instruments
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your test equipment and calibration records
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Instrument
        </Button>
      </div>

      {/* Calibration Alerts */}
      {data?.instruments && data.instruments.some(i => isCalibrationDue(i.next_calibration)) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-800 flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Calibration Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.instruments
                .filter(i => isCalibrationDue(i.next_calibration))
                .map((instrument) => (
                  <div
                    key={instrument.id}
                    className={cn(
                      'flex items-center justify-between p-2 bg-white rounded border',
                      isCalibrationOverdue(instrument.next_calibration)
                        ? 'border-red-300'
                        : 'border-orange-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isCalibrationOverdue(instrument.next_calibration) ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Calendar className="h-4 w-4 text-orange-600" />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {instrument.manufacturer} {instrument.model}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isCalibrationOverdue(instrument.next_calibration)
                            ? 'Overdue: '
                            : 'Due: '}
                          {formatDate(instrument.next_calibration)}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={isCalibrationOverdue(instrument.next_calibration) ? 'destructive' : 'outline'}
                    >
                      {isCalibrationOverdue(instrument.next_calibration) ? 'Overdue' : 'Due Soon'}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            {data?.instruments?.length || 0} Test Instrument{data?.instruments?.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            Equipment registered for use in certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error loading test instruments
            </div>
          ) : data?.instruments?.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No instruments registered
              </h3>
              <p className="text-slate-500 mb-4">
                Add your test equipment to include them in certificates
              </p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Instrument
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Manufacturer / Model</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Last Calibration</TableHead>
                    <TableHead>Next Calibration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.instruments?.map((instrument) => (
                    <TableRow key={instrument.id}>
                      <TableCell className="font-medium">
                        {instrument.instrument_type}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{instrument.manufacturer}</div>
                        <div className="text-sm text-slate-500">{instrument.model}</div>
                      </TableCell>
                      <TableCell>{instrument.serial_number || '-'}</TableCell>
                      <TableCell>{formatDate(instrument.calibration_date)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            isCalibrationOverdue(instrument.next_calibration)
                              ? 'text-red-600 font-medium'
                              : isCalibrationDue(instrument.next_calibration)
                              ? 'text-orange-600'
                              : ''
                          )}
                        >
                          {formatDate(instrument.next_calibration)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {instrument.is_active ? (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(instrument)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingInstrument ? 'Edit Instrument' : 'Add New Instrument'}
            </DialogTitle>
            <DialogDescription>
              {editingInstrument
                ? 'Update the instrument details below'
                : 'Enter the details of your test instrument'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Instrument Type *</Label>
              <Select
                value={formData.instrument_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, instrument_type: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {INSTRUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Manufacturer *</Label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))
                  }
                  placeholder="e.g., Megger"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Model *</Label>
                <Input
                  value={formData.model}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, model: e.target.value }))
                  }
                  placeholder="e.g., MFT1741"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Serial Number</Label>
              <Input
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, serial_number: e.target.value }))
                }
                placeholder="Enter serial number"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Calibration Date</Label>
                <Input
                  type="date"
                  value={formData.calibration_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, calibration_date: e.target.value }))
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Next Calibration Due</Label>
                <Input
                  type="date"
                  value={formData.next_calibration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, next_calibration: e.target.value }))
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-slate-500">
                  Active instruments can be used in certificates
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.instrument_type ||
                !formData.manufacturer ||
                !formData.model ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingInstrument ? 'Update' : 'Add'} Instrument
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

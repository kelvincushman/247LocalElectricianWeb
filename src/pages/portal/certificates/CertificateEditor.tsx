import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCertificate,
  updateCertificate,
  submitCertificate,
  createBoard,
  updateBoard,
  deleteBoard,
  createCircuit,
  updateCircuit,
  deleteCircuit,
  createBulkCircuits,
  reorderCircuits,
  createObservation,
  updateObservation,
  deleteObservation,
} from '@/services/certificateService';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_STATUSES,
  OBSERVATION_CODES,
  EARTHING_ARRANGEMENTS,
  PHASE_CONFIGURATIONS,
  PREMISES_TYPES,
  CIRCUIT_TYPES,
  BREAKER_TYPES,
  RCD_TYPES,
  WIRING_TYPES,
  REF_METHODS,
  COMMON_DOMESTIC_CIRCUITS,
  BREAKER_RATINGS,
  getMaxZs,
} from '@/types/certificate';
import type { CircuitTemplate } from '@/types/certificate';
import type {
  Certificate,
  CertificateBoard,
  CertificateCircuit,
  CertificateObservation,
  ObservationCode,
} from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Home,
  Eye,
  Settings2,
  Search,
  CircuitBoard,
  Image,
  FileText,
  Smartphone,
  Printer,
  CheckSquare,
  Settings,
  RefreshCw,
  FileCheck,
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Loader2,
  User,
  Building2,
  Zap,
  ClipboardList,
  AlertTriangle,
  Edit,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ListPlus,
  Sparkles,
  Copy,
  Move,
  Columns,
  Hash,
  List,
  PenLine,
  Eraser,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Electraform-style navigation tabs
const NAV_TABS = [
  { id: 'installation', label: 'Installation details', icon: Home, badge: 0 },
  { id: 'observations', label: 'Report observations', icon: Eye, badge: 0 },
  { id: 'characteristics', label: 'System characteristics', icon: Settings2 },
  { id: 'schedule', label: 'Inspection Schedule', icon: Search },
  { id: 'boards', label: 'Boards and circuits', icon: CircuitBoard, badge: 1, active: true },
  { id: 'images', label: 'Images', icon: Image, badge: 0 },
  { id: 'additional', label: 'Additional Page', icon: FileText },
  { id: 'mobile', label: 'Mobile Mode', icon: Smartphone },
  { id: 'preview', label: 'Print preview', icon: Printer },
  { id: 'checker', label: 'Content checker', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'refresh', label: 'Refresh', icon: RefreshCw },
];

export default function CertificateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('boards');
  const [formData, setFormData] = useState<Partial<Certificate>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [showBoardDetails, setShowBoardDetails] = useState(true);
  const [showTestResults, setShowTestResults] = useState(true);

  // Board/Circuit dialogs
  const [showBoardDialog, setShowBoardDialog] = useState(false);
  const [editingBoard, setEditingBoard] = useState<CertificateBoard | null>(null);
  const [showCircuitDialog, setShowCircuitDialog] = useState(false);
  const [editingCircuit, setEditingCircuit] = useState<{ circuit: CertificateCircuit | null; boardId: string } | null>(null);
  const [showObservationDialog, setShowObservationDialog] = useState(false);
  const [editingObservation, setEditingObservation] = useState<CertificateObservation | null>(null);
  const [showQuickCircuitDialog, setShowQuickCircuitDialog] = useState<string | null>(null);
  const [draggedCircuit, setDraggedCircuit] = useState<{ id: string; boardId: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificate', id],
    queryFn: () => getCertificate(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.certificate) {
      setFormData(data.certificate);
    }
  }, [data]);

  useEffect(() => {
    if (data?.boards && data.boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(data.boards[0].id);
    }
  }, [data?.boards, selectedBoardId]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Certificate>) => updateCertificate(id!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setHasChanges(false);
      toast({ title: 'Saved', description: 'Certificate updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => submitCertificate(id!),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setShowSubmitDialog(false);
      toast({ title: 'Submitted', description: response.message });
      if (response.status === 'approved') {
        navigate(`/portal/certificates/${id}`);
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Board mutations
  const createBoardMutation = useMutation({
    mutationFn: (data: Partial<CertificateBoard>) => createBoard(id!, data),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setShowBoardDialog(false);
      toast({ title: 'Board Added', description: 'Distribution board added successfully' });
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: Partial<CertificateBoard> }) =>
      updateBoard(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setShowBoardDialog(false);
      setEditingBoard(null);
      toast({ title: 'Board Updated' });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setSelectedBoardId(null);
      toast({ title: 'Board Deleted' });
    },
  });

  // Circuit mutations
  const createCircuitMutation = useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: Partial<CertificateCircuit> }) =>
      createCircuit(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setShowCircuitDialog(false);
      toast({ title: 'Circuit Added' });
    },
  });

  const updateCircuitMutation = useMutation({
    mutationFn: ({ circuitId, data }: { circuitId: string; data: Partial<CertificateCircuit> }) =>
      updateCircuit(circuitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setShowCircuitDialog(false);
      setEditingCircuit(null);
      toast({ title: 'Circuit Updated' });
    },
  });

  const deleteCircuitMutation = useMutation({
    mutationFn: (circuitId: string) => deleteCircuit(circuitId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificate', id] }),
  });

  const bulkCreateCircuitsMutation = useMutation({
    mutationFn: ({ boardId, count }: { boardId: string; count: number }) =>
      createBulkCircuits(boardId, count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      toast({ title: 'Circuits Added' });
    },
  });

  const reorderCircuitsMutation = useMutation({
    mutationFn: ({ boardId, circuitIds }: { boardId: string; circuitIds: string[] }) =>
      reorderCircuits(boardId, circuitIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
    },
  });

  // Observation mutations
  const createObservationMutation = useMutation({
    mutationFn: (data: Partial<CertificateObservation>) => createObservation(id!, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setShowObservationDialog(false);
      toast({ title: 'Observation Added' });
    },
  });

  const updateObservationMutation = useMutation({
    mutationFn: ({ observationId, data }: { observationId: string; data: Partial<CertificateObservation> }) =>
      updateObservation(observationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate', id] });
      setShowObservationDialog(false);
      setEditingObservation(null);
      toast({ title: 'Observation Updated' });
    },
  });

  const deleteObservationMutation = useMutation({
    mutationFn: (observationId: string) => deleteObservation(observationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificate', id] }),
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSectionDataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      section_data: {
        ...(prev.section_data || {}),
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleBoardFieldChange = (boardId: string, field: string, value: any) => {
    updateBoardMutation.mutate({ boardId, data: { [field]: value } });
  };

  const handleAddCircuitFromTemplate = (template: CircuitTemplate, boardId: string) => {
    const circuitData: Partial<CertificateCircuit> = {
      designation: template.designation,
      circuit_type: template.circuit_type,
      rating_amps: template.rating_amps,
      breaker_type: template.breaker_type,
      breaker_bs_en: template.breaker_bs_en,
      wiring_type: template.wiring_type,
      live_csa: template.live_csa,
      cpc_csa: template.cpc_csa,
      ref_method: template.ref_method,
      max_zs: template.max_zs,
      rcd_type: template.rcd_type,
      rcd_rating_ma: template.rcd_rating_ma,
      polarity: 'OK',
      circuit_result: 'pass',
    };
    createCircuitMutation.mutate({ boardId, data: circuitData });
  };

  const isEditable = data?.certificate && ['draft', 'revision_requested'].includes(data.certificate.status);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.certificate) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
        <Button onClick={() => navigate('/portal/certificates')}>
          Back to Certificates
        </Button>
      </div>
    );
  }

  const certificate = data.certificate;
  const boards = data.boards || [];
  const observations = data.observations || [];
  const selectedBoard = boards.find(b => b.id === selectedBoardId);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header Bar - Electraform Style */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-lg font-light">2018+A3:2024</span>
        </div>
        <div className="bg-blue-800 px-6 py-1 rounded">
          <span className="font-medium">REPORT NO: {certificate.certificate_no}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button size="sm" variant="secondary" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => setShowSubmitDialog(true)}>
            <Send className="h-4 w-4 mr-1" />
            Submit
          </Button>
        </div>
      </div>

      {/* Navigation Tabs - Electraform Style */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-center gap-1 py-2 overflow-x-auto">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-[80px]',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'hover:bg-slate-100 text-slate-600'
              )}
            >
              <div className="relative">
                <tab.icon className="h-5 w-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Boards Tab Content */}
        {activeTab === 'boards' && (
          <div className="space-y-4">
            {/* Board Header Bar */}
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
              <span className="font-medium">
                {selectedBoard?.db_name || 'DB-1'} - {selectedBoard?.location || ''} ({selectedBoard?.circuits?.length || selectedBoard?.no_of_ways || 0} ways)
              </span>
              <button
                onClick={() => setShowBoardDetails(!showBoardDetails)}
                className="flex items-center gap-2 text-sm hover:bg-blue-700 px-2 py-1 rounded"
              >
                {showBoardDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showBoardDetails ? 'Hide board details' : 'Show board details'}
              </button>
            </div>

            {/* Board Actions */}
            <div className="bg-white p-3 border rounded-lg flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700"
                  onClick={() => { setEditingBoard(null); setShowBoardDialog(true); }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Board
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selectedBoard) {
                      setEditingBoard(selectedBoard);
                      setShowBoardDialog(true);
                    }
                  }}
                  disabled={!selectedBoard}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit board
                </Button>
                <Button size="sm" variant="outline" disabled={!selectedBoard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Board
                </Button>
                <Button size="sm" variant="outline" disabled={boards.length < 2}>
                  <Move className="h-4 w-4 mr-1" />
                  Move boards
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">DB selector</span>
                <Select
                  value={selectedBoardId || ''}
                  onValueChange={setSelectedBoardId}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        {board.db_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Board Details Panel - Electraform Style */}
            {showBoardDetails && selectedBoard && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="grid md:grid-cols-2 divide-x">
                  {/* Left Column - Applies in every case */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-slate-500 mb-3 text-center">Applies in every case</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">DB name</Label>
                        <Input
                          size={1}
                          value={selectedBoard.db_name || ''}
                          onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'db_name', e.target.value)}
                          disabled={!isEditable}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Supplied from</Label>
                        <Input
                          size={1}
                          value={selectedBoard.supplied_from || ''}
                          onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'supplied_from', e.target.value)}
                          disabled={!isEditable}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Location</Label>
                        <Input
                          size={1}
                          value={selectedBoard.location || ''}
                          onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'location', e.target.value)}
                          disabled={!isEditable}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">No of ways</Label>
                        <Input
                          type="number"
                          value={selectedBoard.no_of_ways || ''}
                          onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'no_of_ways', parseInt(e.target.value) || null)}
                          disabled={!isEditable}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">No of phases</Label>
                        <Input
                          type="number"
                          value={selectedBoard.no_of_phases || 1}
                          onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'no_of_phases', parseInt(e.target.value) || 1)}
                          disabled={!isEditable}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Characteristics at this board */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-slate-500 mb-3 text-center">Characteristics at this board</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="polarity-confirmed"
                          checked={selectedBoard.supply_polarity_confirmed || false}
                          onCheckedChange={(checked) => handleBoardFieldChange(selectedBoard.id, 'supply_polarity_confirmed', checked)}
                          disabled={!isEditable}
                        />
                        <Label htmlFor="polarity-confirmed" className="text-sm">Supply polarity confirmed</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="phase-sequence"
                          checked={selectedBoard.phase_sequence_confirmed || false}
                          onCheckedChange={(checked) => handleBoardFieldChange(selectedBoard.id, 'phase_sequence_confirmed', checked)}
                          disabled={!isEditable}
                        />
                        <Label htmlFor="phase-sequence" className="text-sm">Phase sequence confirmed</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SPD Details Row */}
                <div className="border-t p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 mb-2">SPD Details</h4>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedBoard.spd_type_t1 || false}
                            onCheckedChange={(checked) => handleBoardFieldChange(selectedBoard.id, 'spd_type_t1', checked)}
                            disabled={!isEditable}
                          />
                          Type T1
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedBoard.spd_type_t2 || false}
                            onCheckedChange={(checked) => handleBoardFieldChange(selectedBoard.id, 'spd_type_t2', checked)}
                            disabled={!isEditable}
                          />
                          Type T2
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedBoard.spd_type_t3 || false}
                            onCheckedChange={(checked) => handleBoardFieldChange(selectedBoard.id, 'spd_type_t3', checked)}
                            disabled={!isEditable}
                          />
                          Type T3
                        </label>
                        <label className="flex items-center gap-2 text-sm ml-4">
                          <Checkbox
                            checked={selectedBoard.spd_operation_status_confirmed || false}
                            onCheckedChange={(checked) => handleBoardFieldChange(selectedBoard.id, 'spd_operation_status_confirmed', checked)}
                            disabled={!isEditable}
                          />
                          SPD Operation status confirmed
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overcurrent and Measurements Row */}
                <div className="border-t p-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
                        Overcurrent protective device for the supply circuit
                        <span className="text-blue-500 cursor-help" title="Info">ⓘ</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">BS(EN)</Label>
                          <Input
                            value={selectedBoard.supply_pd_bs_en || ''}
                            onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'supply_pd_bs_en', e.target.value)}
                            disabled={!isEditable}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rating (A)</Label>
                          <Input
                            type="number"
                            value={selectedBoard.supply_pd_rating || ''}
                            onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'supply_pd_rating', parseFloat(e.target.value) || null)}
                            disabled={!isEditable}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Voltage Rating (V)</Label>
                          <Input
                            type="number"
                            value={selectedBoard.supply_pd_voltage_rating || ''}
                            onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'supply_pd_voltage_rating', parseFloat(e.target.value) || null)}
                            disabled={!isEditable}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
                        Measurements at this board
                        <span className="text-blue-500 cursor-help" title="Info">ⓘ</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Zdb (Ω)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={selectedBoard.zdb || ''}
                            onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'zdb', parseFloat(e.target.value) || null)}
                            disabled={!isEditable}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Ipf (kA)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={selectedBoard.ipf || ''}
                            onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'ipf', parseFloat(e.target.value) || null)}
                            disabled={!isEditable}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">RCD time (ms)</Label>
                          <Input
                            type="number"
                            value={selectedBoard.rcd_time_ms || ''}
                            onChange={(e) => handleBoardFieldChange(selectedBoard.id, 'rcd_time_ms', parseFloat(e.target.value) || null)}
                            disabled={!isEditable}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CIRCUITS & TEST RESULTS Section */}
            <div className="bg-white border rounded-lg overflow-hidden">
              {/* Section Header - Blue bar with toggle */}
              <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
                <span className="font-medium">CIRCUITS & TEST RESULTS</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm">Circuits</span>
                  <Switch
                    checked={showTestResults}
                    onCheckedChange={setShowTestResults}
                    className="data-[state=checked]:bg-white data-[state=unchecked]:bg-blue-400"
                  />
                  <span className="text-sm">Test results</span>
                </div>
              </div>

              {/* Circuit Action Toolbar */}
              {isEditable && selectedBoard && (
                <div className="bg-slate-50 border-b px-4 py-2 flex items-center gap-1 flex-wrap">
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-blue-600">
                    <Hash className="h-3 w-3 mr-1" />
                    Change circuit numbers
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-green-600">
                    <List className="h-3 w-3 mr-1" />
                    Re-order circuits
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-8 text-blue-600"
                    onClick={() => setShowQuickCircuitDialog(selectedBoard.id)}
                  >
                    <PenLine className="h-3 w-3 mr-1" />
                    Quick circuit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-blue-600">
                    <CircuitBoard className="h-3 w-3 mr-1" />
                    Create sub-main
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-blue-600">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy circuit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-slate-400" disabled>
                    Paste circuit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-blue-600">
                    <Columns className="h-3 w-3 mr-1" />
                    Fill column
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-blue-600">
                    Choose own overcurrent ratings (A)
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8 bg-yellow-100 border-yellow-300 text-yellow-700">
                    Choose Zs preferences 80%
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-green-600">
                    <Eraser className="h-3 w-3 mr-1" />
                    Clear circuit values
                  </Button>
                </div>
              )}

              {/* Circuits Table */}
              {selectedBoard && (
                <div className="overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader>
                      {/* Row 1: Main column group headers */}
                      <TableRow className="bg-slate-100 border-b-2">
                        <TableHead className="w-8 px-1 text-center" rowSpan={2}>
                          <Plus className="h-3 w-3 mx-auto text-green-600" />
                        </TableHead>
                        <TableHead className="text-center font-bold px-1" colSpan={2}>Circuit</TableHead>
                        <TableHead className="text-center font-bold border-l px-1" colSpan={4}>Conductors</TableHead>
                        <TableHead className="text-center font-bold border-l px-1" colSpan={5}>Overcurrent devices</TableHead>
                        <TableHead className="text-center font-bold border-l px-1" colSpan={2}>RCD</TableHead>
                        {showTestResults && (
                          <TableHead className="text-center font-bold border-l px-1" colSpan={6}>Test Results</TableHead>
                        )}
                        <TableHead className="w-10 px-1" rowSpan={2}></TableHead>
                      </TableRow>
                      {/* Row 2: Sub-column headers */}
                      <TableRow className="bg-slate-50 text-[10px]">
                        <TableHead className="px-1 text-center w-10">Cct No</TableHead>
                        <TableHead className="px-1 min-w-[100px]">Designation</TableHead>
                        <TableHead className="px-1 text-center w-12 border-l">No of points</TableHead>
                        <TableHead className="px-1 text-center w-14">Wiring type</TableHead>
                        <TableHead className="px-1 text-center w-12">Ref method</TableHead>
                        <TableHead className="px-1 text-center w-12">Live (mm²)</TableHead>
                        <TableHead className="px-1 text-center w-12">cpc (mm²)</TableHead>
                        <TableHead className="px-1 text-center w-10 border-l">Dis time (s)</TableHead>
                        <TableHead className="px-1 text-center w-14">BS(EN)</TableHead>
                        <TableHead className="px-1 text-center w-12">Rating (A)</TableHead>
                        <TableHead className="px-1 text-center w-14">Short circuit (kA)</TableHead>
                        <TableHead className="px-1 text-center w-14">Voltage rating (V)</TableHead>
                        <TableHead className="px-1 text-center w-12">Max Zs (Ω)</TableHead>
                        <TableHead className="px-1 text-center w-12 border-l">RCD type</TableHead>
                        <TableHead className="px-1 text-center w-12">IΔn (mA)</TableHead>
                        {showTestResults && (
                          <>
                            <TableHead className="px-1 text-center w-12 border-l">r1+r2</TableHead>
                            <TableHead className="px-1 text-center w-10">R2</TableHead>
                            <TableHead className="px-1 text-center w-10">Zs</TableHead>
                            <TableHead className="px-1 text-center w-10">IR</TableHead>
                            <TableHead className="px-1 text-center w-10">RCD ×1</TableHead>
                            <TableHead className="px-1 text-center w-10">RCD ×5</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedBoard.circuits || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={showTestResults ? 22 : 16} className="text-center py-8">
                            <p className="text-slate-500 mb-3">No circuits added yet</p>
                            {isEditable && (
                              <div className="flex justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowQuickCircuitDialog(selectedBoard.id)}
                                >
                                  <Sparkles className="h-4 w-4 mr-1" />
                                  Quick Add
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => bulkCreateCircuitsMutation.mutate({ boardId: selectedBoard.id, count: 10 })}
                                >
                                  <ListPlus className="h-4 w-4 mr-1" />
                                  Add 10 Circuits
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedBoard.circuits?.map((circuit, index) => (
                          <TableRow
                            key={circuit.id}
                            className={cn(
                              'cursor-pointer hover:bg-blue-50',
                              circuit.circuit_result === 'fail' && 'bg-red-50',
                              circuit.zs && circuit.max_zs && Number(circuit.zs) > Number(circuit.max_zs) && 'bg-amber-50'
                            )}
                            onClick={() => {
                              if (isEditable) {
                                setEditingCircuit({ circuit, boardId: selectedBoard.id });
                                setShowCircuitDialog(true);
                              }
                            }}
                          >
                            <TableCell className="text-center">
                              <GripVertical className="h-3 w-3 text-slate-300 mx-auto" />
                            </TableCell>
                            <TableCell className="text-center font-medium">{circuit.circuit_number}</TableCell>
                            <TableCell className="truncate max-w-[100px]">{circuit.designation || 'Spare'}</TableCell>
                            <TableCell className="text-center border-l">{circuit.no_of_points || '-'}</TableCell>
                            <TableCell className="text-center text-[9px]">{circuit.wiring_type || '-'}</TableCell>
                            <TableCell className="text-center">{circuit.ref_method || '-'}</TableCell>
                            <TableCell className="text-center">{circuit.live_csa || '-'}</TableCell>
                            <TableCell className="text-center">{circuit.cpc_csa || '-'}</TableCell>
                            <TableCell className="text-center border-l">{circuit.disconnection_time || '-'}</TableCell>
                            <TableCell className="text-center text-[9px]">{circuit.breaker_bs_en || '-'}</TableCell>
                            <TableCell className="text-center">{circuit.rating_amps || '-'}</TableCell>
                            <TableCell className="text-center">{circuit.short_circuit_capacity || '-'}</TableCell>
                            <TableCell className="text-center">{circuit.voltage_rating || '-'}</TableCell>
                            <TableCell className="text-center font-medium text-blue-600">{circuit.max_zs || '-'}</TableCell>
                            <TableCell className="text-center border-l">{circuit.rcd_type || '-'}</TableCell>
                            <TableCell className="text-center">{circuit.rcd_rating_ma || '-'}</TableCell>
                            {showTestResults && (
                              <>
                                <TableCell className="text-center border-l">{circuit.r1_plus_r2 ?? '-'}</TableCell>
                                <TableCell className="text-center">{circuit.r2 ?? '-'}</TableCell>
                                <TableCell className={cn(
                                  "text-center font-medium",
                                  circuit.zs && circuit.max_zs && Number(circuit.zs) > Number(circuit.max_zs) && 'text-red-600'
                                )}>
                                  {circuit.zs ?? '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                  {circuit.insulation_resistance_live_earth ? `>${circuit.insulation_resistance_live_earth}` : '-'}
                                </TableCell>
                                <TableCell className="text-center">{circuit.rcd_time_x1 ?? '-'}</TableCell>
                                <TableCell className="text-center">{circuit.rcd_time_x5 ?? '-'}</TableCell>
                              </>
                            )}
                            <TableCell>
                              {isEditable && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCircuitMutation.mutate(circuit.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 text-red-400" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!selectedBoard && boards.length === 0 && (
                <div className="text-center py-12">
                  <CircuitBoard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Distribution Boards</h3>
                  <p className="text-slate-500 mb-4">Add a distribution board to record circuit details</p>
                  {isEditable && (
                    <Button onClick={() => setShowBoardDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Board
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Test Equipment Section */}
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Multifunction</Label>
                  <Input
                    placeholder="-"
                    value={formData.test_instrument_multifunction || ''}
                    onChange={(e) => handleFieldChange('test_instrument_multifunction', e.target.value)}
                    disabled={!isEditable}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Continuity</Label>
                  <Input
                    placeholder="-"
                    value={formData.test_instrument_continuity || ''}
                    onChange={(e) => handleFieldChange('test_instrument_continuity', e.target.value)}
                    disabled={!isEditable}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Insulation resistance</Label>
                  <Input
                    placeholder="-"
                    value={formData.test_instrument_insulation || ''}
                    onChange={(e) => handleFieldChange('test_instrument_insulation', e.target.value)}
                    disabled={!isEditable}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">EFLI Tester</Label>
                  <Input
                    placeholder="-"
                    value={formData.test_instrument_efli || ''}
                    onChange={(e) => handleFieldChange('test_instrument_efli', e.target.value)}
                    disabled={!isEditable}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">RCD tester</Label>
                  <Input
                    placeholder="-"
                    value={formData.test_instrument_rcd || ''}
                    onChange={(e) => handleFieldChange('test_instrument_rcd', e.target.value)}
                    disabled={!isEditable}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Tested by (Capitals)</Label>
                  <Input
                    value={formData.inspector_name || ''}
                    onChange={(e) => handleFieldChange('inspector_name', e.target.value)}
                    disabled={!isEditable}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Signature</Label>
                  <Input
                    placeholder=""
                    disabled={!isEditable}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Date</Label>
                  <Input
                    type="date"
                    value={formData.inspection_date || ''}
                    onChange={(e) => handleFieldChange('inspection_date', e.target.value)}
                    disabled={!isEditable}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Installation Details Tab */}
        {activeTab === 'installation' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">DETAILS OF THE CLIENT / PERSON ORDERING THE REPORT</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Client name</Label>
                  <Input
                    value={formData.client_name || ''}
                    onChange={(e) => handleFieldChange('client_name', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.client_email || ''}
                    onChange={(e) => handleFieldChange('client_email', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Telephone</Label>
                  <Input
                    value={formData.client_phone || ''}
                    onChange={(e) => handleFieldChange('client_phone', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.client_address || ''}
                    onChange={(e) => handleFieldChange('client_address', e.target.value)}
                    disabled={!isEditable}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">DETAILS OF THE INSTALLATION</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Installation Address</Label>
                  <Input
                    value={formData.installation_address || ''}
                    onChange={(e) => handleFieldChange('installation_address', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Postcode</Label>
                  <Input
                    value={formData.installation_postcode || ''}
                    onChange={(e) => handleFieldChange('installation_postcode', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Description of premises</Label>
                  <Select
                    value={formData.premises_type || ''}
                    onValueChange={(v) => handleFieldChange('premises_type', v)}
                    disabled={!isEditable}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREMISES_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated age of installation (Years)</Label>
                  <Input
                    type="number"
                    value={formData.installation_age_years || ''}
                    onChange={(e) => handleFieldChange('installation_age_years', parseInt(e.target.value) || null)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Evidence of additions/alterations</Label>
                  <Select
                    value={formData.evidence_of_alterations || ''}
                    onValueChange={(v) => handleFieldChange('evidence_of_alterations', v)}
                    disabled={!isEditable}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="not_apparent">Not apparent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date of previous inspection</Label>
                  <Input
                    type="date"
                    value={formData.previous_inspection_date || ''}
                    onChange={(e) => handleFieldChange('previous_inspection_date', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Characteristics Tab */}
        {activeTab === 'characteristics' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">SUPPLY CHARACTERISTICS AND EARTHING ARRANGEMENTS</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Earthing arrangements</Label>
                  <Select
                    value={formData.earthing_arrangement || ''}
                    onValueChange={(v) => handleFieldChange('earthing_arrangement', v)}
                    disabled={!isEditable}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {EARTHING_ARRANGEMENTS.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phase configuration</Label>
                  <Select
                    value={formData.phase_configuration || ''}
                    onValueChange={(v) => handleFieldChange('phase_configuration', v)}
                    disabled={!isEditable}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASE_CONFIGURATIONS.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nominal voltage (V)</Label>
                  <Input
                    type="number"
                    value={formData.nominal_voltage || ''}
                    onChange={(e) => handleFieldChange('nominal_voltage', parseFloat(e.target.value) || null)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Nominal frequency (Hz)</Label>
                  <Input
                    type="number"
                    value={formData.nominal_frequency || ''}
                    onChange={(e) => handleFieldChange('nominal_frequency', parseFloat(e.target.value) || null)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>PFC/PSCC - Ipf (kA)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pfc_pscc || ''}
                    onChange={(e) => handleFieldChange('pfc_pscc', parseFloat(e.target.value) || null)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Earth loop impedance - Ze (Ω)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.ze || ''}
                    onChange={(e) => handleFieldChange('ze', parseFloat(e.target.value) || null)}
                    disabled={!isEditable}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">SUPPLY PROTECTIVE DEVICE</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>BS(EN)</Label>
                  <Input
                    value={formData.supply_pd_bs_en || ''}
                    onChange={(e) => handleFieldChange('supply_pd_bs_en', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Input
                    value={formData.supply_pd_type || ''}
                    onChange={(e) => handleFieldChange('supply_pd_type', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <Label>Rated current (A)</Label>
                  <Input
                    type="number"
                    value={formData.supply_pd_rating || ''}
                    onChange={(e) => handleFieldChange('supply_pd_rating', parseFloat(e.target.value) || null)}
                    disabled={!isEditable}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observations Tab */}
        {activeTab === 'observations' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Observations & Recommendations</h3>
                <p className="text-slate-500 text-sm">Record any defects or issues found during inspection</p>
              </div>
              {isEditable && (
                <Button onClick={() => { setEditingObservation(null); setShowObservationDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Observation
                </Button>
              )}
            </div>

            {/* Observation Code Legend */}
            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-lg">
              {Object.entries(OBSERVATION_CODES).map(([code, info]) => (
                <div key={code} className="flex items-center gap-2">
                  <Badge className={cn(info.bgColor, 'text-white min-w-[40px] justify-center')}>
                    {info.label}
                  </Badge>
                  <span className="text-sm text-slate-600">{info.description}</span>
                </div>
              ))}
            </div>

            {observations.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Observations</h3>
                <p className="text-slate-500 mb-4">
                  {certificate.certificate_type === 'eicr'
                    ? 'Add observations for any defects found during inspection'
                    : 'No observations required if installation is satisfactory'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Item</TableHead>
                      <TableHead className="w-20">Schedule</TableHead>
                      <TableHead className="min-w-[300px]">Observation & Recommendation</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>DB/Circuit</TableHead>
                      <TableHead className="w-16">Code</TableHead>
                      {isEditable && <TableHead className="w-20"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {observations.map((obs) => (
                      <TableRow key={obs.id}>
                        <TableCell>{obs.item_number}</TableCell>
                        <TableCell>{obs.schedule_item_no}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{obs.observation}</div>
                            {obs.recommendation && (
                              <div className="text-sm text-slate-500">{obs.recommendation}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{obs.location}</TableCell>
                        <TableCell>{obs.db_circuit_ref}</TableCell>
                        <TableCell>
                          <Badge className={cn(OBSERVATION_CODES[obs.code as ObservationCode]?.bgColor || 'bg-gray-500', 'text-white')}>
                            {obs.code}
                          </Badge>
                        </TableCell>
                        {isEditable && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingObservation(obs);
                                  setShowObservationDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Delete this observation?')) {
                                    deleteObservationMutation.mutate(obs.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Inspection Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Inspection Schedule</h3>
              <p className="text-slate-500 text-sm">BS 7671 Visual Inspection & Testing Schedule</p>
            </div>

            {/* Section A - External Condition */}
            <Card>
              <CardHeader className="bg-slate-100 py-3">
                <CardTitle className="text-sm font-medium">Section A - External Condition of Installation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Item</TableHead>
                      <TableHead>Inspection Check</TableHead>
                      <TableHead className="w-24 text-center">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 'A1', text: 'Safety of intake equipment including condition of service fuse(s)' },
                      { id: 'A2', text: 'Meter tails - Correct CSA and securely connected' },
                      { id: 'A3', text: 'Condition of consumer unit / distribution board(s)' },
                      { id: 'A4', text: 'Adequacy of working space and accessibility to distribution equipment' },
                      { id: 'A5', text: 'Security of fixing of distribution equipment' },
                      { id: 'A6', text: 'Condition of visible wiring systems' },
                      { id: 'A7', text: 'Damage, deterioration, defects, danger' },
                      { id: 'A8', text: 'Presence of adequate identification and notices' },
                    ].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell>{item.text}</TableCell>
                        <TableCell>
                          <Select defaultValue="">
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ok">✓</SelectItem>
                              <SelectItem value="c1">C1</SelectItem>
                              <SelectItem value="c2">C2</SelectItem>
                              <SelectItem value="c3">C3</SelectItem>
                              <SelectItem value="na">N/A</SelectItem>
                              <SelectItem value="lim">LIM</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Section B - Consumer Unit / DB */}
            <Card>
              <CardHeader className="bg-slate-100 py-3">
                <CardTitle className="text-sm font-medium">Section B - Consumer Unit(s) / Distribution Board(s)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Item</TableHead>
                      <TableHead>Inspection Check</TableHead>
                      <TableHead className="w-24 text-center">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 'B1', text: 'Adequacy of existing overcurrent protective devices' },
                      { id: 'B2', text: 'Correct operation of devices for isolation and switching' },
                      { id: 'B3', text: 'Presence of main switch and correct rating' },
                      { id: 'B4', text: 'Main earthing conductor connection to MET' },
                      { id: 'B5', text: 'Protective bonding conductors - Connections and CSA' },
                      { id: 'B6', text: 'Presence and operation of RCD(s)' },
                      { id: 'B7', text: 'Confirmation of SPD requirements considered' },
                      { id: 'B8', text: 'Manual test of RCD(s) by test button' },
                      { id: 'B9', text: 'Enclosure(s) not damaged/deteriorated' },
                      { id: 'B10', text: 'Suitability of enclosure(s) for IP and fire rating' },
                      { id: 'B11', text: 'Presence of danger notices and other warning notices' },
                      { id: 'B12', text: 'Presence of circuit charts' },
                    ].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell>{item.text}</TableCell>
                        <TableCell>
                          <Select defaultValue="">
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ok">✓</SelectItem>
                              <SelectItem value="c1">C1</SelectItem>
                              <SelectItem value="c2">C2</SelectItem>
                              <SelectItem value="c3">C3</SelectItem>
                              <SelectItem value="na">N/A</SelectItem>
                              <SelectItem value="lim">LIM</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Section C - Circuits */}
            <Card>
              <CardHeader className="bg-slate-100 py-3">
                <CardTitle className="text-sm font-medium">Section C - Final Circuits</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Item</TableHead>
                      <TableHead>Inspection Check</TableHead>
                      <TableHead className="w-24 text-center">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 'C1', text: 'Identification of conductors' },
                      { id: 'C2', text: 'Cables correctly selected for current-carrying capacity and voltage drop' },
                      { id: 'C3', text: 'Cables correctly routed, installed and with mechanical protection' },
                      { id: 'C4', text: 'Cables correctly connected at accessories and equipment' },
                      { id: 'C5', text: 'Condition of insulation of live parts' },
                      { id: 'C6', text: 'Non-sheathed cables protected by enclosure in ceiling voids' },
                      { id: 'C7', text: 'Condition of accessories including socket-outlets, switches, etc.' },
                      { id: 'C8', text: 'Suitability of accessories for external influences' },
                      { id: 'C9', text: 'Single-pole switching devices in line conductor only' },
                      { id: 'C10', text: 'Adequacy of connections including cpcs' },
                      { id: 'C11', text: 'Provision of fire barriers, sealing arrangements, protection against thermal effects' },
                      { id: 'C12', text: 'Band II cables segregated from Band I cables' },
                    ].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell>{item.text}</TableCell>
                        <TableCell>
                          <Select defaultValue="">
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ok">✓</SelectItem>
                              <SelectItem value="c1">C1</SelectItem>
                              <SelectItem value="c2">C2</SelectItem>
                              <SelectItem value="c3">C3</SelectItem>
                              <SelectItem value="na">N/A</SelectItem>
                              <SelectItem value="lim">LIM</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Certificate Images</h3>
                <p className="text-slate-500 text-sm">Upload photos of the installation, defects, and labels</p>
              </div>
              {isEditable && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Placeholder for uploaded images */}
              <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 cursor-pointer transition-colors">
                <Image className="h-8 w-8 mb-2" />
                <span className="text-sm">Click to upload</span>
              </div>
            </div>

            <div className="text-center text-sm text-slate-500 py-8">
              <p>Supported formats: JPEG, PNG, WebP (max 10MB per image)</p>
              <p className="mt-1">Tip: Include photos of consumer unit labels, any defects found, and meter readings</p>
            </div>
          </div>
        )}

        {/* Additional Page Tab */}
        {activeTab === 'additional' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <p className="text-slate-500 text-sm">Add any supplementary notes or information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Enter any additional information about the inspection..."
                  className="min-h-[200px] mt-2"
                  value={formData.section_data?.additional_notes || ''}
                  onChange={(e) => handleSectionDataChange('additional_notes', e.target.value)}
                  disabled={!isEditable}
                />
              </div>

              <div>
                <Label htmlFor="limitations">Limitations</Label>
                <Textarea
                  id="limitations"
                  placeholder="Record any limitations to the inspection..."
                  className="min-h-[100px] mt-2"
                  value={formData.section_data?.limitations || ''}
                  onChange={(e) => handleSectionDataChange('limitations', e.target.value)}
                  disabled={!isEditable}
                />
              </div>
            </div>
          </div>
        )}

        {/* Print Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Print Preview</h3>
                <p className="text-slate-500 text-sm">Preview and generate certificate PDF</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview PDF
                </Button>
                <Button>
                  <Printer className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </div>

            <div className="bg-slate-100 rounded-lg p-8 min-h-[600px] flex items-center justify-center">
              <div className="text-center text-slate-500">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">PDF Preview</h4>
                <p>Click "Preview PDF" to generate a preview of the certificate</p>
                <p className="text-sm mt-2">
                  Certificate: {certificate.certificate_no} | Type: {CERTIFICATE_TYPES[certificate.certificate_type]?.label || certificate.certificate_type}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Checker Tab */}
        {activeTab === 'checker' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Content Checker</h3>
                <p className="text-slate-500 text-sm">Validate certificate completeness before submission</p>
              </div>
              <Button onClick={() => {/* Run validation */}}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Run Check
              </Button>
            </div>

            {/* Validation Results */}
            <div className="space-y-4">
              {/* Client Details */}
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Client Details</CardTitle>
                    <Badge className={formData.client_name && formData.client_address ? 'bg-green-500' : 'bg-red-500'}>
                      {formData.client_name && formData.client_address ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {formData.client_name ? <CheckSquare className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                      Client name
                    </li>
                    <li className="flex items-center gap-2">
                      {formData.client_address ? <CheckSquare className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                      Client address
                    </li>
                    <li className="flex items-center gap-2">
                      {formData.client_email ? <CheckSquare className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      Client email (optional)
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Installation Details */}
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Installation Details</CardTitle>
                    <Badge className={formData.installation_address ? 'bg-green-500' : 'bg-red-500'}>
                      {formData.installation_address ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {formData.installation_address ? <CheckSquare className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                      Installation address
                    </li>
                    <li className="flex items-center gap-2">
                      {formData.inspection_date ? <CheckSquare className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                      Inspection date
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Boards & Circuits */}
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Boards & Circuits</CardTitle>
                    <Badge className={boards.length > 0 ? 'bg-green-500' : 'bg-red-500'}>
                      {boards.length > 0 ? `${boards.length} board(s)` : 'No boards'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {boards.length > 0 ? <CheckSquare className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                      At least one distribution board
                    </li>
                    <li className="flex items-center gap-2">
                      {boards.some(b => (b.circuits?.length || 0) > 0) ? <CheckSquare className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      Circuits recorded
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Overall Assessment (EICR only) */}
              {certificate.certificate_type === 'eicr' && (
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Overall Assessment</CardTitle>
                      <Badge className={formData.overall_assessment ? 'bg-green-500' : 'bg-red-500'}>
                        {formData.overall_assessment || 'Not set'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        {formData.overall_assessment ? <CheckSquare className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                        Overall assessment selected
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Certificate Settings</h3>
              <p className="text-slate-500 text-sm">Configure options for this certificate</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-calculate Max Zs</Label>
                  <p className="text-sm text-slate-500">Automatically calculate maximum Zs values based on device ratings</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Apply 80% rule for existing installations</Label>
                  <p className="text-sm text-slate-500">Use 80% of maximum Zs values for existing installations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show test result warnings</Label>
                  <p className="text-sm text-slate-500">Highlight test results that exceed maximum values</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Electraform Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex items-center justify-center gap-1 py-2 overflow-x-auto">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-[70px]',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-slate-100 text-slate-600'
              )}
            >
              <div className="relative">
                <tab.icon className="h-5 w-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-1 whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Board Dialog */}
      <BoardDialog
        open={showBoardDialog}
        onOpenChange={setShowBoardDialog}
        board={editingBoard}
        onSave={(data) => {
          if (editingBoard) {
            updateBoardMutation.mutate({ boardId: editingBoard.id, data });
          } else {
            createBoardMutation.mutate(data);
          }
        }}
        isLoading={createBoardMutation.isPending || updateBoardMutation.isPending}
      />

      {/* Circuit Dialog */}
      <CircuitDialog
        open={showCircuitDialog}
        onOpenChange={setShowCircuitDialog}
        circuit={editingCircuit?.circuit || null}
        boardId={editingCircuit?.boardId || ''}
        onSave={(data) => {
          if (editingCircuit?.circuit) {
            updateCircuitMutation.mutate({ circuitId: editingCircuit.circuit.id, data });
          } else if (editingCircuit?.boardId) {
            createCircuitMutation.mutate({ boardId: editingCircuit.boardId, data });
          }
        }}
        isLoading={createCircuitMutation.isPending || updateCircuitMutation.isPending}
      />

      {/* Observation Dialog */}
      <ObservationDialog
        open={showObservationDialog}
        onOpenChange={setShowObservationDialog}
        observation={editingObservation}
        boards={boards}
        onSave={(data) => {
          if (editingObservation) {
            updateObservationMutation.mutate({ observationId: editingObservation.id, data });
          } else {
            createObservationMutation.mutate(data);
          }
        }}
        isLoading={createObservationMutation.isPending || updateObservationMutation.isPending}
      />

      {/* Quick Circuit Dialog */}
      <QuickCircuitDialog
        open={!!showQuickCircuitDialog}
        onOpenChange={() => setShowQuickCircuitDialog(null)}
        boardId={showQuickCircuitDialog || ''}
        onSelect={(template) => {
          if (showQuickCircuitDialog) {
            handleAddCircuitFromTemplate(template, showQuickCircuitDialog);
          }
          setShowQuickCircuitDialog(null);
        }}
      />

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Approval</DialogTitle>
            <DialogDescription>
              This certificate will be sent to a QS for review. Make sure all details are correct before submitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
              {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Board Dialog Component
function BoardDialog({
  open,
  onOpenChange,
  board,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: CertificateBoard | null;
  onSave: (data: Partial<CertificateBoard>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<CertificateBoard>>({});

  useEffect(() => {
    if (board) {
      setFormData(board);
    } else {
      setFormData({
        db_name: 'DB-1',
        supplied_from: 'Origin',
        no_of_ways: 10,
        no_of_phases: 1,
      });
    }
  }, [board, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{board ? 'Edit Board' : 'Add Distribution Board'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>DB Name</Label>
              <Input
                value={formData.db_name || ''}
                onChange={(e) => setFormData({ ...formData, db_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Supplied From</Label>
              <Input
                value={formData.supplied_from || ''}
                onChange={(e) => setFormData({ ...formData, supplied_from: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>No. of Ways</Label>
              <Input
                type="number"
                value={formData.no_of_ways || ''}
                onChange={(e) => setFormData({ ...formData, no_of_ways: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>No. of Phases</Label>
              <Input
                type="number"
                value={formData.no_of_phases || 1}
                onChange={(e) => setFormData({ ...formData, no_of_phases: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {board ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Circuit Dialog Component
function CircuitDialog({
  open,
  onOpenChange,
  circuit,
  boardId,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circuit: CertificateCircuit | null;
  boardId: string;
  onSave: (data: Partial<CertificateCircuit>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<CertificateCircuit>>({});

  useEffect(() => {
    if (circuit) {
      setFormData(circuit);
    } else {
      setFormData({
        designation: '',
        circuit_type: 'socket',
        breaker_type: 'B',
        rating_amps: 32,
        polarity: 'OK',
      });
    }
  }, [circuit, open]);

  // Auto-calculate max Zs when breaker type and rating change
  useEffect(() => {
    if (formData.breaker_type && formData.rating_amps) {
      const maxZs = getMaxZs(formData.breaker_type, formData.rating_amps);
      if (maxZs) {
        setFormData(prev => ({ ...prev, max_zs: maxZs }));
      }
    }
  }, [formData.breaker_type, formData.rating_amps]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{circuit ? 'Edit Circuit' : 'Add Circuit'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Designation</Label>
              <Input
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Lights, Ring Final"
              />
            </div>
            <div>
              <Label>Circuit Type</Label>
              <Select
                value={formData.circuit_type || ''}
                onValueChange={(v) => setFormData({ ...formData, circuit_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CIRCUIT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>No. of Points</Label>
              <Input
                type="number"
                value={formData.no_of_points || ''}
                onChange={(e) => setFormData({ ...formData, no_of_points: parseInt(e.target.value) || null })}
              />
            </div>
          </div>

          {/* Conductors */}
          <div>
            <h4 className="font-medium mb-2">Conductors</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Wiring Type</Label>
                <Select
                  value={formData.wiring_type || ''}
                  onValueChange={(v) => setFormData({ ...formData, wiring_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {WIRING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ref Method</Label>
                <Select
                  value={formData.ref_method || ''}
                  onValueChange={(v) => setFormData({ ...formData, ref_method: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {REF_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Live CSA (mm²)</Label>
                <Input
                  value={formData.live_csa || ''}
                  onChange={(e) => setFormData({ ...formData, live_csa: e.target.value })}
                />
              </div>
              <div>
                <Label>CPC CSA (mm²)</Label>
                <Input
                  value={formData.cpc_csa || ''}
                  onChange={(e) => setFormData({ ...formData, cpc_csa: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Overcurrent Device */}
          <div>
            <h4 className="font-medium mb-2">Overcurrent Device</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={formData.breaker_type || ''}
                  onValueChange={(v) => setFormData({ ...formData, breaker_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {BREAKER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rating (A)</Label>
                <Select
                  value={formData.rating_amps?.toString() || ''}
                  onValueChange={(v) => setFormData({ ...formData, rating_amps: parseFloat(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {BREAKER_RATINGS.map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>{rating}A</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>BS(EN)</Label>
                <Input
                  value={formData.breaker_bs_en || ''}
                  onChange={(e) => setFormData({ ...formData, breaker_bs_en: e.target.value })}
                  placeholder="e.g., 60898"
                />
              </div>
              <div>
                <Label>Max Zs (Ω)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.max_zs || ''}
                  onChange={(e) => setFormData({ ...formData, max_zs: parseFloat(e.target.value) || null })}
                  className="bg-blue-50"
                />
              </div>
            </div>
          </div>

          {/* RCD */}
          <div>
            <h4 className="font-medium mb-2">RCD</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>RCD Type</Label>
                <Select
                  value={formData.rcd_type || ''}
                  onValueChange={(v) => setFormData({ ...formData, rcd_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {RCD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>IΔn (mA)</Label>
                <Select
                  value={formData.rcd_rating_ma?.toString() || ''}
                  onValueChange={(v) => setFormData({ ...formData, rcd_rating_ma: v ? parseInt(v) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    <SelectItem value="30">30mA</SelectItem>
                    <SelectItem value="100">100mA</SelectItem>
                    <SelectItem value="300">300mA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <h4 className="font-medium mb-2">Test Results</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>R1+R2 (Ω)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.r1_plus_r2 ?? ''}
                  onChange={(e) => setFormData({ ...formData, r1_plus_r2: parseFloat(e.target.value) || null })}
                />
              </div>
              <div>
                <Label>R2 (Ω)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.r2 ?? ''}
                  onChange={(e) => setFormData({ ...formData, r2: parseFloat(e.target.value) || null })}
                />
              </div>
              <div>
                <Label>Zs (Ω)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.zs ?? ''}
                  onChange={(e) => setFormData({ ...formData, zs: parseFloat(e.target.value) || null })}
                />
              </div>
              <div>
                <Label>IR L-E (MΩ)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.insulation_resistance_live_earth ?? ''}
                  onChange={(e) => setFormData({ ...formData, insulation_resistance_live_earth: parseFloat(e.target.value) || null })}
                />
              </div>
              <div>
                <Label>Polarity</Label>
                <Select
                  value={formData.polarity || ''}
                  onValueChange={(v) => setFormData({ ...formData, polarity: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OK">OK</SelectItem>
                    <SelectItem value="FAIL">FAIL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>RCD ×1 (ms)</Label>
                <Input
                  type="number"
                  value={formData.rcd_time_x1 ?? ''}
                  onChange={(e) => setFormData({ ...formData, rcd_time_x1: parseFloat(e.target.value) || null })}
                />
              </div>
              <div>
                <Label>RCD ×5 (ms)</Label>
                <Input
                  type="number"
                  value={formData.rcd_time_x5 ?? ''}
                  onChange={(e) => setFormData({ ...formData, rcd_time_x5: parseFloat(e.target.value) || null })}
                />
              </div>
              <div>
                <Label>Result</Label>
                <Select
                  value={formData.circuit_result || ''}
                  onValueChange={(v) => setFormData({ ...formData, circuit_result: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="lim">LIM</SelectItem>
                    <SelectItem value="na">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {circuit ? 'Update' : 'Add Circuit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Observation Dialog Component
function ObservationDialog({
  open,
  onOpenChange,
  observation,
  boards,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observation: CertificateObservation | null;
  boards: CertificateBoard[];
  onSave: (data: Partial<CertificateObservation>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<CertificateObservation>>({});

  useEffect(() => {
    if (observation) {
      setFormData(observation);
    } else {
      setFormData({ code: 'C2' });
    }
  }, [observation, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{observation ? 'Edit Observation' : 'Add Observation'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code</Label>
              <Select
                value={formData.code || ''}
                onValueChange={(v) => setFormData({ ...formData, code: v as ObservationCode })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select code" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OBSERVATION_CODES).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(info.bgColor, 'text-white text-xs')}>{info.label}</Badge>
                        <span>{info.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Schedule Item No.</Label>
              <Input
                value={formData.schedule_item_no || ''}
                onChange={(e) => setFormData({ ...formData, schedule_item_no: e.target.value })}
                placeholder="e.g., 5.2"
              />
            </div>
          </div>
          <div>
            <Label>Observation</Label>
            <Textarea
              value={formData.observation || ''}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="Describe the defect or issue..."
              rows={3}
            />
          </div>
          <div>
            <Label>Recommendation</Label>
            <Textarea
              value={formData.recommendation || ''}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              placeholder="Recommended action..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Kitchen"
              />
            </div>
            <div>
              <Label>DB / Circuit Ref</Label>
              <Input
                value={formData.db_circuit_ref || ''}
                onChange={(e) => setFormData({ ...formData, db_circuit_ref: e.target.value })}
                placeholder="e.g., DB-1/3"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {observation ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quick Circuit Dialog Component
function QuickCircuitDialog({
  open,
  onOpenChange,
  boardId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  onSelect: (template: CircuitTemplate) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Add Common Circuits</DialogTitle>
          <DialogDescription>
            Select a common circuit type to add with pre-configured settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
          {COMMON_DOMESTIC_CIRCUITS.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 justify-start text-left"
              onClick={() => onSelect(template)}
            >
              <div>
                <div className="font-medium">{template.designation}</div>
                <div className="text-xs text-slate-500">
                  {template.breaker_type}{template.rating_amps}A | {template.wiring_type} | {template.live_csa}mm²
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Certificate Service - API calls for certificate management
import type {
  Certificate,
  CertificateBoard,
  CertificateCircuit,
  CertificateObservation,
  CertificateReview,
  CertificateRequest,
  TestInstrument,
  EngineerProfile,
  NotificationSettings,
  CreateCertificateData,
  UpdateCertificateData,
  CreateBoardData,
  CreateCircuitData,
  CreateObservationData,
} from '@/types/certificate';

const API_BASE = '/api/portal';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============ CERTIFICATES ============

export interface CertificateListResponse {
  certificates: Certificate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CertificateDetailResponse {
  certificate: Certificate;
  boards: CertificateBoard[];
  observations: CertificateObservation[];
  reviews: CertificateReview[];
  testInstruments: TestInstrument[];
}

export async function getCertificates(params?: {
  status?: string;
  certificate_type?: string;
  property_id?: string;
  company_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<CertificateListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.certificate_type) searchParams.set('certificate_type', params.certificate_type);
  if (params?.property_id) searchParams.set('property_id', params.property_id);
  if (params?.company_id) searchParams.set('company_id', params.company_id);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  return apiCall<CertificateListResponse>(`/certificates?${searchParams.toString()}`);
}

export async function getCertificate(id: string): Promise<CertificateDetailResponse> {
  return apiCall<CertificateDetailResponse>(`/certificates/${id}`);
}

export async function createCertificate(data: CreateCertificateData): Promise<{ certificate: Certificate }> {
  return apiCall<{ certificate: Certificate }>('/certificates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCertificate(id: string, data: UpdateCertificateData): Promise<{ certificate: Certificate }> {
  return apiCall<{ certificate: Certificate }>(`/certificates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCertificate(id: string): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>(`/certificates/${id}`, {
    method: 'DELETE',
  });
}

export async function submitCertificate(id: string): Promise<{ message: string; status: string }> {
  return apiCall<{ message: string; status: string }>(`/certificates/${id}/submit`, {
    method: 'POST',
  });
}

// ============ QS APPROVAL ============

export async function getPendingCertificates(params?: {
  page?: number;
  limit?: number;
}): Promise<CertificateListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  return apiCall<CertificateListResponse>(`/qs/pending?${searchParams.toString()}`);
}

export async function getPendingCount(): Promise<{ count: number }> {
  return apiCall<{ count: number }>('/qs/pending-count');
}

export async function approveCertificate(id: string, comments?: string): Promise<{ message: string; status: string }> {
  return apiCall<{ message: string; status: string }>(`/certificates/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
}

export async function rejectCertificate(id: string, reason: string, comments?: string): Promise<{ message: string; status: string }> {
  return apiCall<{ message: string; status: string }>(`/certificates/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason, comments }),
  });
}

export async function requestRevision(id: string, comments: string): Promise<{ message: string; status: string }> {
  return apiCall<{ message: string; status: string }>(`/certificates/${id}/revision`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
}

// ============ BOARDS ============

export async function getBoards(certificateId: string): Promise<{ boards: CertificateBoard[] }> {
  return apiCall<{ boards: CertificateBoard[] }>(`/certificates/${certificateId}/boards`);
}

export async function createBoard(certificateId: string, data: CreateBoardData): Promise<{ board: CertificateBoard }> {
  return apiCall<{ board: CertificateBoard }>(`/certificates/${certificateId}/boards`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBoard(boardId: string, data: Partial<CertificateBoard>): Promise<{ board: CertificateBoard }> {
  return apiCall<{ board: CertificateBoard }>(`/boards/${boardId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBoard(boardId: string): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>(`/boards/${boardId}`, {
    method: 'DELETE',
  });
}

// ============ CIRCUITS ============

export async function createCircuit(boardId: string, data: CreateCircuitData): Promise<{ circuit: CertificateCircuit }> {
  return apiCall<{ circuit: CertificateCircuit }>(`/boards/${boardId}/circuits`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCircuit(circuitId: string, data: Partial<CertificateCircuit>): Promise<{ circuit: CertificateCircuit }> {
  return apiCall<{ circuit: CertificateCircuit }>(`/circuits/${circuitId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCircuit(circuitId: string): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>(`/circuits/${circuitId}`, {
    method: 'DELETE',
  });
}

export async function createBulkCircuits(boardId: string, count: number): Promise<{ circuits: CertificateCircuit[] }> {
  return apiCall<{ circuits: CertificateCircuit[] }>(`/boards/${boardId}/circuits/bulk`, {
    method: 'POST',
    body: JSON.stringify({ count }),
  });
}

export async function reorderCircuits(boardId: string, circuitIds: string[]): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>(`/boards/${boardId}/circuits/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ circuit_ids: circuitIds }),
  });
}

// ============ OBSERVATIONS ============

export async function getObservations(certificateId: string): Promise<{ observations: CertificateObservation[] }> {
  return apiCall<{ observations: CertificateObservation[] }>(`/certificates/${certificateId}/observations`);
}

export async function createObservation(certificateId: string, data: CreateObservationData): Promise<{ observation: CertificateObservation }> {
  return apiCall<{ observation: CertificateObservation }>(`/certificates/${certificateId}/observations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateObservation(observationId: string, data: Partial<CertificateObservation>): Promise<{ observation: CertificateObservation }> {
  return apiCall<{ observation: CertificateObservation }>(`/observations/${observationId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteObservation(observationId: string): Promise<{ success: boolean }> {
  return apiCall<{ success: boolean }>(`/observations/${observationId}`, {
    method: 'DELETE',
  });
}

// ============ CERTIFICATE REQUESTS ============

export interface CertificateRequestListResponse {
  requests: CertificateRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCertificateRequests(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<CertificateRequestListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  return apiCall<CertificateRequestListResponse>(`/certificate-requests?${searchParams.toString()}`);
}

export async function createCertificateRequest(data: {
  property_id: string;
  certificate_type: string;
  preferred_date?: string;
  notes?: string;
}): Promise<{ request: CertificateRequest }> {
  return apiCall<{ request: CertificateRequest }>('/certificate-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCertificateRequest(
  id: string,
  data: { status?: string; assigned_job_id?: string }
): Promise<{ request: CertificateRequest }> {
  return apiCall<{ request: CertificateRequest }>(`/certificate-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============ TEST INSTRUMENTS ============

export async function getTestInstruments(): Promise<{ instruments: TestInstrument[] }> {
  return apiCall<{ instruments: TestInstrument[] }>('/test-instruments');
}

export async function createTestInstrument(data: Partial<TestInstrument>): Promise<{ instrument: TestInstrument }> {
  return apiCall<{ instrument: TestInstrument }>('/test-instruments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTestInstrument(id: string, data: Partial<TestInstrument>): Promise<{ instrument: TestInstrument }> {
  return apiCall<{ instrument: TestInstrument }>(`/test-instruments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============ ENGINEER PROFILE ============

export async function getEngineerProfile(): Promise<{ profile: EngineerProfile | null }> {
  return apiCall<{ profile: EngineerProfile | null }>('/engineer-profile');
}

export async function updateEngineerProfile(data: Partial<EngineerProfile>): Promise<{ profile: EngineerProfile }> {
  return apiCall<{ profile: EngineerProfile }>('/engineer-profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============ NOTIFICATION SETTINGS ============

export async function getNotificationSettings(): Promise<{ settings: NotificationSettings }> {
  return apiCall<{ settings: NotificationSettings }>('/notification-settings');
}

export async function updateNotificationSettings(data: Partial<NotificationSettings>): Promise<{ settings: NotificationSettings }> {
  return apiCall<{ settings: NotificationSettings }>('/notification-settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============ PDF GENERATION ============

export async function generateCertificatePdf(id: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/certificates/${id}/pdf`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'PDF generation failed' }));
    throw new Error(error.error || 'PDF generation failed');
  }

  return response.blob();
}

export function downloadCertificatePdf(id: string, certificateNo: string): void {
  // Open PDF in new window for download/print
  window.open(`/api/portal/certificates/${id}/pdf`, '_blank');
}

// ============ CUSTOMER CERTIFICATES ============

export async function getMyCertificates(params?: {
  page?: number;
  limit?: number;
}): Promise<CertificateListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  return apiCall<CertificateListResponse>(`/my/certificates?${searchParams.toString()}`);
}

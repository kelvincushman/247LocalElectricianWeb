import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/api/portal/gateway';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export function useGatewayStats() {
  return useQuery({ queryKey: ['gateway', 'stats'], queryFn: () => apiFetch('/stats'), refetchInterval: 30000 });
}

export function useGatewaySessions(params?: { status?: string; channel?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.channel) q.set('channel', params.channel);
  if (params?.page) q.set('page', String(params.page));
  return useQuery({ queryKey: ['gateway', 'sessions', params], queryFn: () => apiFetch(`/sessions?${q}`) });
}

export function useGatewaySession(id: string) {
  return useQuery({ queryKey: ['gateway', 'session', id], queryFn: () => apiFetch(`/sessions/${id}`), enabled: !!id });
}

export function useSessionReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiFetch(`/sessions/${id}/reply`, { method: 'POST', body: JSON.stringify({ content }) }),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: ['gateway', 'session', id] }); },
  });
}

export function useSessionAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigned_to }: { id: string; assigned_to: string }) =>
      apiFetch(`/sessions/${id}/assign`, { method: 'POST', body: JSON.stringify({ assigned_to }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gateway', 'sessions'] }); },
  });
}

export function useSessionClose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/sessions/${id}/close`, { method: 'POST' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gateway', 'sessions'] }); },
  });
}

export function useGatewayChannels() {
  return useQuery({ queryKey: ['gateway', 'channels'], queryFn: () => apiFetch('/channels') });
}

export function useReconnectChannel() {
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/channels/${id}/reconnect`, { method: 'POST' }),
  });
}

export function useGatewayLeads(params?: { status?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.page) q.set('page', String(params.page));
  return useQuery({ queryKey: ['gateway', 'leads', params], queryFn: () => apiFetch(`/leads?${q}`) });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/leads/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gateway', 'leads'] }); },
  });
}

export function useGatewayAnalytics(days = 30) {
  return useQuery({ queryKey: ['gateway', 'analytics', days], queryFn: () => apiFetch(`/analytics?days=${days}`) });
}

export function useGatewayAgent() {
  return useQuery({ queryKey: ['gateway', 'agent'], queryFn: () => apiFetch('/agent') });
}

export function useOutboundMessages(status = 'pending') {
  return useQuery({ queryKey: ['gateway', 'outbound', status], queryFn: () => apiFetch(`/outbound?status=${status}`) });
}

export function useScheduleOutbound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { recipient_id: string; channel_type: string; message_type: string; content: string; scheduled_for?: string }) =>
      apiFetch('/outbound', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gateway', 'outbound'] }); },
  });
}

export function useOverdueInvoices() {
  return useQuery({ queryKey: ['gateway', 'invoices', 'overdue'], queryFn: () => apiFetch('/invoices/overdue') });
}

export function useChaseInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, channel }: { id: string; channel?: string }) =>
      apiFetch(`/invoices/${id}/chase`, { method: 'POST', body: JSON.stringify({ channel }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gateway', 'invoices'] }); },
  });
}

export function useExpiringCertificates(months = 3) {
  return useQuery({ queryKey: ['gateway', 'certificates', 'expiring', months], queryFn: () => apiFetch(`/certificates/expiring?months=${months}`) });
}

export function useGatewayEmails(limit = 50) {
  return useQuery({ queryKey: ['gateway', 'emails', limit], queryFn: () => apiFetch(`/emails?limit=${limit}`) });
}

const statusConfig: Record<string, { color: string; label: string }> = {
  connected: { color: 'bg-green-500', label: 'Connected' },
  disconnected: { color: 'bg-red-500', label: 'Disconnected' },
  error: { color: 'bg-red-500', label: 'Error' },
  configured: { color: 'bg-yellow-500', label: 'Configured' },
  active: { color: 'bg-green-500', label: 'Active' },
};

export function ChannelStatusIndicator({ status }: { status: string }) {
  const config = statusConfig[status] || { color: 'bg-gray-400', label: status };
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.color} animate-pulse`} />
      <span className="text-sm text-muted-foreground">{config.label}</span>
    </div>
  );
}

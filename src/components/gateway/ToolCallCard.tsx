import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ToolCall {
  name: string;
  input?: Record<string, unknown>;
  result?: unknown;
}

export function ToolCallCard({ toolCalls }: { toolCalls: ToolCall[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <Card className="bg-gray-50 border-dashed">
      <CardContent className="py-2 px-3">
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-xs w-full justify-between p-0 h-auto">
          <span>AI used {toolCalls.length} tool{toolCalls.length > 1 ? 's' : ''}</span>
          <span>{expanded ? 'Hide' : 'Show'}</span>
        </Button>
        {expanded && (
          <div className="mt-2 space-y-2">
            {toolCalls.map((tc, i) => (
              <div key={i} className="text-xs bg-white rounded p-2 border">
                <p className="font-mono font-medium text-blue-700">{tc.name}</p>
                {tc.input && (
                  <pre className="text-gray-600 mt-1 overflow-x-auto max-h-32">
                    {JSON.stringify(tc.input, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

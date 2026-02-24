import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Briefcase,
  UserPlus,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls: any | null;
  created_at: string;
}

interface Conversation {
  id: string;
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  visitor_postcode: string | null;
  status: string;
  lead_captured: boolean;
  job_id: string | null;
  customer_id: string | null;
  started_at: string;
  last_message_at: string;
  closed_at: string | null;
  messages: Message[];
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-800',
  converted: 'bg-blue-100 text-blue-800',
};

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const { isStaff } = usePortalAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchConversation();
    }
  }, [id]);

  const fetchConversation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portal/chatbot/conversations/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await response.json();
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessage = (content: string) => {
    let formatted = content;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  if (!isStaff) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>{error || 'Conversation not found'}</p>
        <Link to="/portal/chatbot/conversations">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Conversations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/portal/chatbot/conversations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {conversation.visitor_name || 'Anonymous Visitor'}
          </h1>
          <p className="text-slate-500">Conversation started {formatDate(conversation.started_at)}</p>
        </div>
        <Badge className={statusColors[conversation.status] || statusColors.active}>
          {conversation.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Visitor Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Visitor Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Visitor Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conversation.visitor_name && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-0.5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium">{conversation.visitor_name}</p>
                  </div>
                </div>
              )}
              {conversation.visitor_email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <a
                      href={`mailto:${conversation.visitor_email}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {conversation.visitor_email}
                    </a>
                  </div>
                </div>
              )}
              {conversation.visitor_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-0.5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <a
                      href={`tel:${conversation.visitor_phone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {conversation.visitor_phone}
                    </a>
                  </div>
                </div>
              )}
              {conversation.visitor_postcode && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Postcode</p>
                    <p className="font-medium">{conversation.visitor_postcode}</p>
                  </div>
                </div>
              )}
              {!conversation.visitor_name &&
                !conversation.visitor_email &&
                !conversation.visitor_phone && (
                  <p className="text-slate-400 italic">No contact information captured</p>
                )}
            </CardContent>
          </Card>

          {/* Status & Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lead Captured</span>
                {conversation.lead_captured ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Messages</span>
                <span className="font-medium">{conversation.messages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Activity</span>
                <span className="text-sm">{formatDate(conversation.last_message_at)}</span>
              </div>

              {/* Links to related records */}
              <div className="pt-4 border-t space-y-2">
                {conversation.customer_id && (
                  <Link to={`/portal/customers/${conversation.customer_id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <UserPlus className="mr-2 h-4 w-4" />
                      View Customer
                    </Button>
                  </Link>
                )}
                {conversation.job_id && (
                  <Link to={`/portal/jobs/${conversation.job_id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Job
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {conversation.messages.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No messages in this conversation</p>
                ) : (
                  conversation.messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    const showDateHeader =
                      index === 0 ||
                      new Date(message.created_at).toDateString() !==
                        new Date(conversation.messages[index - 1].created_at).toDateString();

                    return (
                      <div key={message.id}>
                        {showDateHeader && (
                          <div className="flex items-center justify-center my-4">
                            <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
                              {new Date(message.created_at).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </span>
                          </div>
                        )}
                        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                          {!isUser && (
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">⚡</span>
                            </div>
                          )}
                          {isUser && (
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>
                          )}
                          <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
                            <div
                              className={`rounded-lg p-3 max-w-[85%] ${
                                isUser
                                  ? 'bg-primary text-white rounded-tr-none'
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
                              }`}
                            >
                              {isUser ? (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              ) : (
                                <p
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                />
                              )}
                            </div>
                            <div
                              className={`flex items-center gap-2 mt-1 text-xs text-slate-400 ${
                                isUser ? 'justify-end' : ''
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {formatTime(message.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

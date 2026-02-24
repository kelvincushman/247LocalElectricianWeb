import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePortalAuth } from '@/contexts/PortalAuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Home,
  Briefcase,
  FileText,
  Receipt,
  Calendar,
  FolderOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileCheck,
  ClipboardCheck,
  Award,
  PlusCircle,
  Bot,
  MessageSquare,
  Radio,
  Target,
  BarChart3,
  Mail,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  staffOnly?: boolean;
  adminOnly?: boolean;
  businessCustomerOnly?: boolean;
  qsOnly?: boolean;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'Customers', href: '/portal/customers', icon: Users, staffOnly: true },
  { label: 'Companies', href: '/portal/companies', icon: Building2, staffOnly: true },
  { label: 'Properties', href: '/portal/properties', icon: Home },
  { label: 'Jobs', href: '/portal/jobs', icon: Briefcase },
  { label: 'Certificates', href: '/portal/certificates', icon: FileCheck, staffOnly: true },
  { label: 'QS Approvals', href: '/portal/qs', icon: ClipboardCheck, qsOnly: true },
  { label: 'Quotes', href: '/portal/quotes', icon: FileText },
  { label: 'Invoices', href: '/portal/invoices', icon: Receipt },
  { label: 'Calendar', href: '/portal/calendar', icon: Calendar, staffOnly: true },
  { label: 'Documents', href: '/portal/documents', icon: FolderOpen },
  { label: 'Users', href: '/portal/users', icon: Users, adminOnly: true },
  { label: 'Settings', href: '/portal/settings', icon: Settings, adminOnly: true },
];

// AI Gateway nav items (staff/admin only)
const gatewayNavItems: NavItem[] = [
  { label: 'AI Gateway', href: '/portal/gateway', icon: Bot, staffOnly: true },
  { label: 'Inbox', href: '/portal/gateway/inbox', icon: MessageSquare, staffOnly: true },
  { label: 'Channels', href: '/portal/gateway/channels', icon: Radio, staffOnly: true },
  { label: 'Leads', href: '/portal/gateway/leads', icon: Target, staffOnly: true },
  { label: 'Chase Invoices', href: '/portal/gateway/invoices', icon: Receipt, staffOnly: true },
  { label: 'Cert Renewals', href: '/portal/gateway/certificates', icon: FileCheck, staffOnly: true },
  { label: 'Email', href: '/portal/gateway/emails', icon: Mail, staffOnly: true },
  { label: 'Outbound', href: '/portal/gateway/outbound', icon: Send, staffOnly: true },
  { label: 'Analytics', href: '/portal/gateway/analytics', icon: BarChart3, staffOnly: true },
];

// Business customer specific nav items
const businessCustomerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'My Properties', href: '/portal/my-properties', icon: Home },
  { label: 'My Jobs', href: '/portal/my-jobs', icon: Briefcase },
  { label: 'My Certificates', href: '/portal/my-certificates', icon: Award },
  { label: 'Request Certificate', href: '/portal/my-certificates/request', icon: PlusCircle },
  { label: 'My Documents', href: '/portal/my-documents', icon: FolderOpen },
];

export default function PortalSidebar() {
  const { user, isStaff, isAdmin, isBusinessCustomer, canApprove, logout } = usePortalAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/portal/login';
  };

  // Filter nav items based on user type
  const filteredNavItems = isBusinessCustomer
    ? businessCustomerNavItems
    : navItems.filter((item) => {
        if (item.adminOnly && !isAdmin) return false;
        if (item.staffOnly && !isStaff) return false;
        if (item.businessCustomerOnly && !isBusinessCustomer) return false;
        if (item.qsOnly && !canApprove) return false;
        return true;
      });

  return (
    <aside
      className={cn(
        'bg-slate-900 text-white h-screen flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <Link to="/portal" className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2">
            <Zap className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-emergency font-bold">247</span>
              <span className="text-white font-bold">Portal</span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-slate-700">
          <p className="text-sm font-medium truncate">{user.display_name}</p>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
          {user.company_name && (
            <p className="text-xs text-primary mt-1 truncate">{user.company_name}</p>
          )}
          <span className="inline-flex mt-2 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
            {user.user_type.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/portal' && location.pathname.startsWith(item.href) && !location.pathname.startsWith('/portal/gateway'));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* AI Gateway Section */}
        {isStaff && (
          <>
            {!isCollapsed && (
              <div className="px-4 pt-4 pb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Gateway</p>
              </div>
            )}
            {isCollapsed && <div className="border-t border-slate-700 mx-2 my-2" />}
            <ul className="space-y-1 px-2">
              {gatewayNavItems.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/portal/gateway' && location.pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Back to Website & Logout */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Back to Website' : undefined}
        >
          <Home className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Back to Website</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-colors',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ArrowLeftRight, 
  ShoppingCart, 
  Receipt, 
  ShieldCheck, 
  UserCheck, 
  Store, 
  Warehouse
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, switchRole } = useAuth();

  // Navigation items mapped by role access
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'employee'] as UserRole[]
    },
    {
      to: '/inventory',
      label: 'Inventory & Items',
      icon: Boxes,
      roles: ['admin', 'employee'] as UserRole[],
      badge: 'QR Live'
    },
    {
      to: '/transfers',
      label: 'Stock Transfers',
      icon: ArrowLeftRight,
      roles: ['admin', 'employee'] as UserRole[]
    },
    {
      to: '/sales',
      label: 'Sales & Billing',
      icon: ShoppingCart,
      roles: ['admin', 'employee'] as UserRole[]
    },
    {
      to: '/invoices',
      label: 'Invoices & WhatsApp',
      icon: Receipt,
      roles: ['admin', 'employee'] as UserRole[]
    },
    {
      to: '/products',
      label: 'Product Catalog',
      icon: Package,
      roles: ['admin'] as UserRole[], // Admin-managed master catalog
      adminOnly: true
    }
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B132B] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-[#090F22]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-wide">
              SM
            </div>
            <div>
              <span className="font-semibold text-white text-sm tracking-tight block">
                Stock Manager
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                PWA Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Store Location Status Ribbon */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/60">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Store: <b>STR-01</b></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Warehouse className="w-3.5 h-3.5 text-amber-400" />
              <span>Godown: <b>GDN-01</b></span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {role === 'admin' ? 'Administration' : 'Store Operations'}
          </div>

          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <span className="text-[9px] font-medium bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                    Admin
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Role Switcher in Sidebar (Demo Ready) */}
        <div className="p-3 border-t border-slate-800 bg-[#090F22]/90">
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span className="text-[11px] font-medium text-slate-300">
                  Role: <strong className="text-white capitalize">{role}</strong>
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                Demo
              </span>
            </div>

            <p className="text-[10px] text-slate-400 mb-2 leading-tight">
              Test UI with different authorization scopes:
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className={`py-1 text-[11px] font-medium rounded transition ${
                  role === 'admin'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => switchRole('employee')}
                className={`py-1 text-[11px] font-medium rounded transition ${
                  role === 'employee'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Employee
              </button>
            </div>
          </div>

          <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">{user?.name}</span>
            <span className="text-[10px] text-slate-400">v1.0-pwa</span>
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  QrCode, 
  Store, 
  Warehouse, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LOCATIONS } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenQrScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenQrScanner }) => {
  const { user, role, currentLocation, setCurrentLocation, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger & Location Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden hover:bg-slate-100 transition"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location Context Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setCurrentLocation('store')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
              currentLocation === 'store'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{LOCATIONS.store.name}</span>
            <span className="sm:hidden">Store</span>
          </button>

          <button
            onClick={() => setCurrentLocation('godown')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
              currentLocation === 'godown'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{LOCATIONS.godown.name}</span>
            <span className="sm:hidden">Godown</span>
          </button>
        </div>
      </div>

      {/* Center: Search Field (Desktop) */}
      <div className="hidden md:flex items-center max-w-xs w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, Product, or Item QR..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right Actions: Quick QR Scan, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick QR Scan Action Button */}
        <button
          onClick={onOpenQrScanner}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          title="Scan Physical Item QR Code"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Scan Item QR</span>
        </button>

        {/* Notifications */}
        <button
          className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition relative"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {user?.name ? user.name.substring(0, 2) : 'US'}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <span className="font-semibold text-slate-800 block truncate max-w-[110px]">
                {user?.name}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">{role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fade-in text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1 inline-block px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded capitalize">
                  {role} Scope
                </span>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-left transition font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out / Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

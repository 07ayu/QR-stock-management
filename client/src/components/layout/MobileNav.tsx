import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Boxes, QrCode, ArrowLeftRight, ShoppingCart } from 'lucide-react';

interface MobileNavProps {
  onOpenQrScanner: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenQrScanner }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 px-2 py-1.5 shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Boxes className="w-5 h-5 mb-0.5" />
          <span>Inventory</span>
        </NavLink>

        {/* Center Prominent QR Scan Button */}
        <button
          type="button"
          onClick={onOpenQrScanner}
          className="-mt-5 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white active:scale-95 transition"
          aria-label="Scan Item QR Code"
        >
          <QrCode className="w-6 h-6" />
        </button>

        <NavLink
          to="/transfers"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <ArrowLeftRight className="w-5 h-5 mb-0.5" />
          <span>Transfers</span>
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span>Billing</span>
        </NavLink>
      </div>
    </nav>
  );
};

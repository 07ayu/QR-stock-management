import React from 'react';
import { AlertCircle, AlertTriangle, Inbox, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, icon, action }) => {
  return (
    <div className="text-center py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {action && <div className="inline-block">{action}</div>}
    </div>
  );
};

export const LoadingState: React.FC<{
  message?: string;
}> = ({ message = 'Loading inventory data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium text-slate-600">{message}</p>
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Failed to load records', message, onRetry }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
      <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
      <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
      <p className="text-xs text-rose-700 max-w-md mx-auto mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
};

export const DemoBanner: React.FC = () => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  return (
    <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px] tracking-wide uppercase border border-amber-500/30">
          Demo Dataset
        </span>
        <span className="text-slate-300">
          Displaying simulated retail records. Backend REST controllers are pending in NestJS.
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3.5 h-3.5" />
              Connected (Online)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              Offline (Stock Mutations Blocked)
            </span>
          )}
        </div>
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Stock changes require live network</span>
        </div>
      </div>
    </div>
  );
};

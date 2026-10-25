import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@stockmgmt.local');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, selectedRole);
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setSelectedRole(role);
    const targetEmail = role === 'admin' ? 'admin@stockmgmt.local' : 'vikram.store@stockmgmt.local';
    setEmail(targetEmail);
    setLoading(true);
    await login(targetEmail, role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md font-bold text-xl">
            SM
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
          Stock Management System
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Single Store & Godown Inventory Management PWA
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200/80 sm:px-10">
          {/* Demo Mode Notice */}
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Demo Mode Active</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              NestJS backend authentication routes (<code>/auth/login</code>) have not yet been deployed. Quick demo accounts are provided below to inspect role-based access.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full" size="md">
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          {/* Quick Role Switcher Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Sign In
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Role</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('employee')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>Employee Role</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Stock Management PWA • Designed for Store & Godown Logistics
        </p>
      </div>
    </div>
  );
};

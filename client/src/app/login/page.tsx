'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { HeartPulse, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await login(email, password);
      toast.success('Signed in successfully');
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })?.response
          ?.data?.message ||
        (err as { response?: { data?: { message?: string; error?: string } } })?.response
          ?.data?.error ||
        'Invalid email or password';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@doctor-tracker.com');
    setPassword('password123');
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="w-full max-w-md">
        {/* Brand / Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/30 text-white mb-4">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Doctor Tracker
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Healthcare Management & Medical Analytics
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to access the admin portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="admin@doctor-tracker.com"
                  className={`block w-full rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border ${
                    errors.email
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`block w-full rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border ${
                    errors.password
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Demo Credentials
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
              >
                Auto-fill
              </button>
            </div>
            <p className="mt-1">
              <span className="text-slate-500">Email:</span>{' '}
              <code className="text-slate-800 font-mono">admin@doctor-tracker.com</code>
            </p>
            <p className="mt-0.5">
              <span className="text-slate-500">Password:</span>{' '}
              <code className="text-slate-800 font-mono">password123</code>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Doctor Tracker &bull; HIPAA Compliant Architecture &bull; All Rights Reserved
        </p>
      </div>
    </div>
  );
}

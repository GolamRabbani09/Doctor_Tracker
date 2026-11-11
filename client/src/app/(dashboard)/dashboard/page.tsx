'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '@/services/api';
import { DashboardStats } from '@/types';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#6366f1',
  '#14b8a6',
  '#f97316',
  '#84cc16',
];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsApi.getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      console.error('Error fetching dashboard stats:', err);
      const msg = 'Failed to load dashboard metrics. Please check if the server is running.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Format trend data for AreaChart
  const formattedTrends = React.useMemo(() => {
    if (!stats?.registrationTrends || stats.registrationTrends.length === 0) {
      return [];
    }
    return stats.registrationTrends.map((item) => {
      const monthIdx = item._id?.month ? item._id.month - 1 : 0;
      const monthName = MONTH_NAMES[monthIdx] || `M${item._id?.month}`;
      const year = item._id?.year || '';
      return {
        label: `${monthName} ${year}`,
        doctors: item.doctors || 0,
        patients: item.patients || 0,
      };
    });
  }, [stats]);

  // Top 10 doctors for bar chart
  const formattedDoctorPatients = React.useMemo(() => {
    if (!stats?.doctorPatientDistribution) return [];
    return [...stats.doctorPatientDistribution]
      .sort((a, b) => b.patientCount - a.patientCount)
      .slice(0, 10);
  }, [stats]);

  // Format specializations for pie chart
  const formattedSpecializations = React.useMemo(() => {
    if (!stats?.specializations) return [];
    return stats.specializations.map((spec) => ({
      name: spec._id || 'General',
      value: spec.count,
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Analytics Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time medical activity and clinic metrics
          </p>
        </div>

        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="w-24 h-4" />
                <Skeleton variant="circular" className="w-10 h-10" />
              </div>
              <Skeleton className="w-16 h-8" />
              <Skeleton className="w-32 h-3 mt-3" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl border border-gray-200 h-80 flex flex-col justify-between">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-full h-56" />
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200 h-80 flex flex-col justify-between">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-full h-56" />
          </div>
        </div>

        {/* Bottom Chart Skeleton */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 h-88 flex flex-col justify-between">
          <Skeleton className="w-56 h-5" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-red-200 text-center my-8 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Unable to Load Dashboard
        </h3>
        <p className="text-sm text-gray-500 max-w-md mb-6">{error}</p>
        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const totalDoctors = stats?.totalDoctors ?? 0;
  const totalPatients = stats?.totalPatients ?? 0;
  const avgPatientsPerDoctor = stats?.avgPatientsPerDoctor
    ? Number(stats.avgPatientsPerDoctor).toFixed(1)
    : '0.0';
  const recentTotal = (stats?.recentDoctors ?? 0) + (stats?.recentPatients ?? 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Analytics Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time medical activity, patient load, and registration statistics
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* TOP ROW: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Doctors"
          value={totalDoctors}
          icon={Users}
          color="blue"
          subtitle="Registered practitioners"
        />
        <StatsCard
          title="Total Patients"
          value={totalPatients}
          icon={UserCheck}
          color="green"
          subtitle="Active patient records"
        />
        <StatsCard
          title="Avg Patients / Doctor"
          value={avgPatientsPerDoctor}
          icon={Activity}
          color="purple"
          subtitle="Caseload distribution"
        />
        <StatsCard
          title="New This Month"
          value={recentTotal}
          icon={TrendingUp}
          color="orange"
          subtitle={`${stats?.recentDoctors ?? 0} docs, ${
            stats?.recentPatients ?? 0
          } patients`}
        />
      </div>

      {/* SECOND ROW: 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Patients per Doctor Bar Chart */}
        <div className="p-6 bg-white rounded-xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">
              Patients per Doctor
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Top 10 physicians by patient volume
            </p>
          </div>
          <div className="h-72 w-full">
            {formattedDoctorPatients.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <Stethoscope className="h-8 w-8 mb-2 opacity-50" />
                No doctor patient data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedDoctorPatients}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <YAxis
                    dataKey="doctorName"
                    type="category"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      border: 'none',
                    }}
                    formatter={(val: any) => [`${val} patients`, 'Caseload']}
                  />
                  <Bar
                    dataKey="patientCount"
                    name="Patients"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RIGHT: Specialization Distribution Pie Chart */}
        <div className="p-6 bg-white rounded-xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">
              Specialization Distribution
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Breakdown of doctors across medical specialties
            </p>
          </div>
          <div className="h-72 w-full">
            {formattedSpecializations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <Activity className="h-8 w-8 mb-2 opacity-50" />
                No specialization data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedSpecializations}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {formattedSpecializations.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      border: 'none',
                    }}
                    formatter={(val: any) => [`${val} doctors`, 'Count']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* THIRD ROW: Registration Trends Area Chart */}
      <div className="p-6 bg-white rounded-xl border border-gray-200/90 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Registration Trends (Last 12 Months)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Monthly acquisition trajectory for doctors and patients
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              Doctors
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Patients
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          {formattedTrends.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
              <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
              No registration history available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedTrends}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="doctors"
                  name="Doctors Registered"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDocs)"
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  name="Patients Registered"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPatients)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

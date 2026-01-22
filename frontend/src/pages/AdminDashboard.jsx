import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ServerIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../services/adminApi';
import toast from 'react-hot-toast';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalWorkflows: 0,
    activeInstances: 0,
    totalTasks: 0,
    totalUsers: 0,
  });
  const [analytics, setAnalytics] = useState({
    workflowsByStatus: [],
    tasksByStatus: [],
    completionTrend: [],
    performanceMetrics: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, analyticsData] = await Promise.all([
        adminApi.getSystemStatistics(),
        adminApi.getWorkflowAnalytics(),
      ]);
      setStatistics(stats);
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error('Failed to load admin dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const systemStats = [
    {
      name: 'Total Workflows',
      value: statistics.totalWorkflows,
      icon: ServerIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      name: 'Active Instances',
      value: statistics.activeInstances,
      icon: ChartBarIcon,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'Total Tasks',
      value: statistics.totalTasks,
      icon: ClipboardDocumentCheckIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      name: 'Total Users',
      value: statistics.totalUsers,
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">System-wide analytics and statistics</p>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bg} rounded-md p-3`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Workflows by Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Instances by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.workflowsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.workflowsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.tasksByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Completion Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Completion Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.completionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="started" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Average Completion Time by Workflow</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.performanceMetrics} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Hours', position: 'insideBottom' }} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="avgTime" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <p className="text-sm text-gray-500">
            Visit <a href="/admin/instances" className="text-indigo-600 hover:text-indigo-500">Instance Monitor</a> for detailed activity logs
          </p>
        </div>
      </div>
    </div>
  );
}

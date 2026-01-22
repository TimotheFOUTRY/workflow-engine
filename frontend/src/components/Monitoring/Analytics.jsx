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
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';
import { CalendarIcon } from '@heroicons/react/24/outline';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    workflowPerformance: [],
    taskCompletion: [],
    userActivity: [],
    errorRates: [],
  });
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getWorkflowAnalytics({ days: parseInt(dateRange) });
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="mt-1 text-sm text-gray-500">Workflow and task performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Workflow Performance */}
      <div className="bg-white shadow-sm rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Workflow Performance (Avg. Completion Time)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.workflowPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgTime" fill="#4F46E5" name="Avg Time (hours)" />
            <Bar dataKey="count" fill="#10B981" name="Total Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Task Completion Trend */}
      <div className="bg-white shadow-sm rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Task Completion Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.taskCompletion}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10B981"
              strokeWidth={2}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="created"
              stroke="#4F46E5"
              strokeWidth={2}
              name="Created"
            />
            <Line
              type="monotone"
              dataKey="overdue"
              stroke="#EF4444"
              strokeWidth={2}
              name="Overdue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            User Activity (Tasks Completed)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.userActivity} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="user" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Error Rates */}
        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Workflow Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.errorRates}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.errorRates.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white shadow-sm rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Workflows</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.workflowPerformance?.reduce((sum, w) => sum + (w.count || 0), 0) || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.taskCompletion?.reduce((sum, t) => sum + (t.completed || 0), 0) || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Completion Time</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.workflowPerformance?.length > 0
                ? (
                    analytics.workflowPerformance.reduce((sum, w) => sum + (w.avgTime || 0), 0) /
                    analytics.workflowPerformance.length
                  ).toFixed(1)
                : 0}{' '}
              hrs
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.errorRates?.length > 0
                ? (
                    ((analytics.errorRates.find((e) => e.name === 'completed')?.value || 0) /
                      analytics.errorRates.reduce((sum, e) => sum + e.value, 0)) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

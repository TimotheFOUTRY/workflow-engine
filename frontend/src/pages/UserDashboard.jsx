import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useTaskStatistics, useMyTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const { data: statistics = {}, isLoading: statsLoading } = useTaskStatistics();
  const { data: tasksResponse, isLoading: tasksLoading } = useMyTasks({ limit: 10, status: 'pending' });
  
  const tasks = tasksResponse?.data || [];
  const loading = statsLoading || tasksLoading;

  const stats = [
    {
      name: 'Pending Tasks',
      value: statistics?.data?.pending || statistics?.pending || 0,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      name: 'Completed',
      value: statistics?.data?.completed || statistics?.completed || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'Overdue',
      value: statistics?.data?.overdue || statistics?.overdue || 0,
      icon: ExclamationCircleIcon,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      name: 'Total Tasks',
      value: statistics?.data?.total || statistics?.total || 0,
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.firstName || 'User'}!</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-3 sm:p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bg} rounded-md p-2 sm:p-3`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-lg sm:text-2xl font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 sm:py-5 border-b border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900">Recent Tasks</h3>
            <Link
              to="/tasks"
              className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No pending tasks</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600 block"
                    >
                      {task.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="truncate max-w-[150px] sm:max-w-none">{task.workflowName}</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                        <span className="sm:hidden">{format(new Date(task.createdAt), 'MMM d')}</span>
                      </span>
                      {task.dueDate && (
                        <span className={new Date(task.dueDate) < new Date() ? 'text-red-600' : ''}>
                          Due: {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
                    <span className={`text-xs sm:text-sm font-medium ${getPriorityColor(task.priority)} capitalize`}>
                      {task.priority}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

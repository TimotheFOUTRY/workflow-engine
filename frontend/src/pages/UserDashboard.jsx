import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { taskApi } from '../services/taskApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const [statistics, setStatistics] = useState({
    pending: 0,
    completed: 0,
    overdue: 0,
    total: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, tasksData] = await Promise.all([
        taskApi.getTaskStatistics(),
        taskApi.getMyTasks({ limit: 10, status: 'pending' }),
      ]);
      setStatistics(stats);
      setTasks(tasksData.tasks || tasksData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Pending Tasks',
      value: statistics.pending,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      name: 'Completed',
      value: statistics.completed,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'Overdue',
      value: statistics.overdue,
      icon: ExclamationCircleIcon,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      name: 'Total Tasks',
      value: statistics.total,
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of your tasks and activities</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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

      {/* Recent Tasks */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
            <Link
              to="/tasks"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
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
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {task.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>{task.workflowName}</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {format(new Date(task.createdAt), 'MMM d, yyyy')}
                      </span>
                      {task.dueDate && (
                        <span className={new Date(task.dueDate) < new Date() ? 'text-red-600' : ''}>
                          Due: {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
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

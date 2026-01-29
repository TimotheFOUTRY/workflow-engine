import React from 'react';
import { usePendingUsers, useApproveUser, useRejectUser } from '../../hooks/useUsers';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function PendingUsers() {
  const { data: usersResponse, isLoading: loading } = usePendingUsers();
  const approveUserMutation = useApproveUser();
  const rejectUserMutation = useRejectUser();

  const users = usersResponse?.data || [];

  const handleApprove = async (userId) => {
    await approveUserMutation.mutateAsync(userId);
  };

  const handleReject = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cet utilisateur ?')) {
      return;
    }
    await rejectUserMutation.mutateAsync(userId);
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
        <h2 className="text-2xl font-bold text-gray-900">
          Utilisateurs en attente d'approbation
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {users.length} utilisateur{users.length !== 1 ? 's' : ''} en attente
        </p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur en attente</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tous les utilisateurs ont été traités.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            En attente
                          </span>
                        </div>
                        <div className="flex items-center mt-1 space-x-4">
                          <p className="text-sm text-gray-500 flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            {user.username}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            {user.email}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Inscrit le {format(new Date(user.createdAt), 'dd/MM/yyyy à HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex items-center space-x-3">
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={actionLoading === user.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      disabled={actionLoading === user.id}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Rejeter
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

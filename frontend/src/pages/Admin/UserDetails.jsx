import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser, useUpdateUser } from '../../hooks/useUsers';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: userResponse, isLoading } = useUser(id);
  const updateUserMutation = useUpdateUser();

  const user = userResponse?.data;

  const handleStatusChange = async (newStatus) => {
    if (confirm(`Êtes-vous sûr de vouloir ${newStatus === 'approved' ? 'approuver' : 'rejeter'} cet utilisateur ?`)) {
      await updateUserMutation.mutateAsync({ userId: id, data: { status: newStatus } });
    }
  };

  const handleToggleActive = async () => {
    if (confirm(`Êtes-vous sûr de vouloir ${user.isActive ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
      await updateUserMutation.mutateAsync({ userId: id, data: { isActive: !user.isActive } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Utilisateur non trouvé</p>
        <Link to="/admin/users" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      approved: 'Approuvé',
      pending: 'En attente',
      rejected: 'Rejeté',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      admin: 'Administrateur',
      manager: 'Manager',
      user: 'Utilisateur',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Détails de l'utilisateur</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {user.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={updateUserMutation.isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Approuver
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={updateUserMutation.isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                <XCircleIcon className="h-5 w-5" />
                Rejeter
              </button>
            </>
          )}
          <button
            onClick={handleToggleActive}
            disabled={updateUserMutation.isLoading}
            className={`px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 ${
              user.isActive
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {user.isActive ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-indigo-600" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </h3>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rôle</label>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Statut</label>
                  <div className="mt-1">{getStatusBadge(user.status)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white shadow-sm rounded-lg border p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Informations de contact</h4>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>

            {user.firstName && (
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Prénom</p>
                  <p className="text-gray-900">{user.firstName}</p>
                </div>
              </div>
            )}

            {user.lastName && (
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="text-gray-900">{user.lastName}</p>
                </div>
              </div>
            )}

            {user.service && (
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Service</p>
                  <p className="text-gray-900">{user.service}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white shadow-sm rounded-lg border p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Informations du compte</h4>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date d'inscription</p>
                <p className="text-gray-900">{format(new Date(user.createdAt), 'dd/MM/yyyy à HH:mm')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Dernière modification</p>
                <p className="text-gray-900">{format(new Date(user.updatedAt), 'dd/MM/yyyy à HH:mm')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`h-5 w-5 rounded-full mt-0.5 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-500">État du compte</p>
                <p className="text-gray-900">{user.isActive ? 'Actif' : 'Désactivé'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Identifiant</p>
                <p className="text-gray-900 text-xs font-mono">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white shadow-sm rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/admin/users/${id}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Modifier l'utilisateur
          </Link>
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe ?')) {
                // TODO: Implémenter la réinitialisation du mot de passe
              }
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Réinitialiser le mot de passe
          </button>
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                // TODO: Implémenter la suppression
                navigate('/admin/users');
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Supprimer l'utilisateur
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { useGroups, useAddMember, useRemoveMember } from '../hooks/useGroups';
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const MembersPage = () => {
  const { user } = useAuth();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, pending, inactive

  const isAdmin = user?.role === 'admin';

  // Filter users based on search and status
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      u.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get groups where user can manage members (own groups or all if admin)
  const manageableGroups = groups.filter(g => 
    isAdmin || g.createdBy === user?.id
  );

  // Get groups that a specific user is member of
  const getUserGroups = (userId) => {
    return groups.filter(g => g.members?.includes(userId));
  };

  // Check if user is in a specific group
  const isUserInGroup = (userId, groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.members?.includes(userId);
  };

  const handleToggleUserInGroup = async (userId, groupId) => {
    const inGroup = isUserInGroup(userId, groupId);
    
    try {
      if (inGroup) {
        await removeMember.mutateAsync({ groupId, userId });
      } else {
        await addMember.mutateAsync({ groupId, userId });
      }
    } catch (error) {
      console.error('Error toggling user in group:', error);
      alert(inGroup ? 'Erreur lors du retrait du membre' : 'Erreur lors de l\'ajout du membre');
    }
  };

  const openGroupModal = (u) => {
    setSelectedUser(u);
    setShowGroupModal(true);
  };

  const closeGroupModal = () => {
    setSelectedUser(null);
    setShowGroupModal(false);
  };

  if (usersLoading || groupsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Membres</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez les membres et leurs groupes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tous' : 
                 status === 'active' ? 'Actifs' :
                 status === 'pending' ? 'En attente' :
                 'Inactifs'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <span>Total: <strong>{filteredUsers.length}</strong></span>
          <span>Groupes disponibles: <strong>{manageableGroups.length}</strong></span>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groupes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((u) => {
              const userGroups = getUserGroups(u.id);
              
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {u.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {u.role === 'admin' ? 'Admin' :
                       u.role === 'manager' ? 'Manager' :
                       'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.status === 'active' ? 'bg-green-100 text-green-800' :
                      u.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {u.status === 'active' ? 'Actif' :
                       u.status === 'pending' ? 'En attente' :
                       'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {userGroups.length > 0 ? (
                        userGroups.slice(0, 2).map(g => (
                          <span
                            key={g.id}
                            className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded"
                          >
                            {g.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Aucun groupe</span>
                      )}
                      {userGroups.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{userGroups.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openGroupModal(u)}
                      className="inline-flex items-center px-3 py-1 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      Gérer groupes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun membre ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* Group Management Modal */}
      {showGroupModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Groupes de {selectedUser.name}
                </h2>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              <button
                onClick={closeGroupModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {manageableGroups.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Aucun groupe disponible. Créez d'abord un groupe.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {manageableGroups.map((group) => {
                  const inGroup = isUserInGroup(selectedUser.id, group.id);
                  const isCreator = group.createdBy === selectedUser.id;
                  const canToggle = !isCreator && (isAdmin || group.createdBy === user?.id);
                  
                  return (
                    <div
                      key={group.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        inGroup 
                          ? 'border-indigo-200 bg-indigo-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                          {group.isPublic && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                              Public
                            </span>
                          )}
                          {isCreator && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                              Créateur
                            </span>
                          )}
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {group.members?.length || 0} membre(s)
                        </p>
                      </div>
                      
                      {canToggle && (
                        <button
                          onClick={() => handleToggleUserInGroup(selectedUser.id, group.id)}
                          disabled={addMember.isPending || removeMember.isPending}
                          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                            inGroup
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {inGroup ? (
                            <span className="flex items-center">
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Retirer
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Ajouter
                            </span>
                          )}
                        </button>
                      )}
                      
                      {!canToggle && inGroup && (
                        <div className="ml-4 flex items-center text-green-600">
                          <CheckIcon className="h-5 w-5 mr-1" />
                          <span className="text-sm font-medium">Membre</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeGroupModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;

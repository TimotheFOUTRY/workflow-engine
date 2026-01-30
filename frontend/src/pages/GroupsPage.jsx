import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup, useAddMember, useRemoveMember } from '../hooks/useGroups';
import { useUsers } from '../hooks/useUsers';
import { PlusIcon, UsersIcon, GlobeAltIcon, LockClosedIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const GroupsPage = () => {
  const { user } = useAuth();
  const { data: groups = [], isLoading } = useGroups();
  const { data: usersData = [], isLoading: usersLoading } = useUsers();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  // Ensure users is always an array
  const users = Array.isArray(usersData) ? usersData : [];

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await createGroup.mutateAsync(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', isPublic: false });
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Erreur lors de la création du groupe');
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      await updateGroup.mutateAsync({
        id: editingGroup.id,
        ...formData,
        members: selectedMembers.map(m => m.id),
      });
      setEditingGroup(null);
      setFormData({ name: '', description: '', isPublic: false });
      setSelectedMembers([]);
      setMemberSearch('');
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Erreur lors de la mise à jour du groupe');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return;
    try {
      await deleteGroup.mutateAsync(groupId);
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Erreur lors de la suppression du groupe');
    }
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      isPublic: group.isPublic,
    });
    // Charger les membres existants
    const existingMembers = group.members?.map(memberId => {
      return users.find(u => u.id === memberId);
    }).filter(Boolean) || [];
    setSelectedMembers(existingMembers);
    setMemberSearch('');
  };

  const openMembersModal = (group) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
  };

  const handleAddMember = async (userId) => {
    try {
      await addMember.mutateAsync({ groupId: selectedGroup.id, userId });
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Erreur lors de l\'ajout du membre');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;
    try {
      await removeMember.mutateAsync({ groupId: selectedGroup.id, userId });
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Erreur lors du retrait du membre');
    }
  };

  if (isLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groupes</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez vos groupes d'utilisateurs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouveau groupe
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const canEdit = isAdmin || group.createdBy === user?.id;
          
          return (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    {group.isPublic ? (
                      <GlobeAltIcon className="h-5 w-5 text-green-600" title="Groupe public" />
                    ) : (
                      <LockClosedIcon className="h-5 w-5 text-gray-600" title="Groupe privé" />
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 mr-1" />
                  <span>{group.members?.length || 0} membre(s)</span>
                </div>
                <span className="text-xs">
                  {group.isPublic ? 'Public' : 'Privé'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openMembersModal(group)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Membres
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => openEditModal(group)}
                      className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun groupe</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer un nouveau groupe.
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingGroup) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingGroup ? 'Modifier le groupe' : 'Créer un groupe'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingGroup(null);
                  setFormData({ name: '', description: '', isPublic: false });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du groupe *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nom du groupe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Description du groupe"
                    rows="3"
                  />
                </div>

                {isAdmin && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                      Groupe public (visible par tous)
                    </label>
                  </div>
                )}

                {!isAdmin && (
                  <p className="text-xs text-gray-500">
                    En tant qu'utilisateur standard, vous ne pouvez créer que des groupes privés.
                  </p>
                )}

                {/* Membres - Autocomplete (seulement en mode édition) */}
                {editingGroup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membres
                    </label>
                    
                    {/* Selected Members */}
                    {selectedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedMembers.map((member) => (
                          <span
                            key={member.id}
                            className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                          >
                            {member.name}
                            <button
                              type="button"
                              onClick={() => setSelectedMembers(selectedMembers.filter(m => m.id !== member.id))}
                              className="ml-2 text-indigo-600 hover:text-indigo-800"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Autocomplete Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={memberSearch}
                        onChange={(e) => {
                          setMemberSearch(e.target.value);
                          setShowMemberDropdown(true);
                        }}
                        onFocus={() => setShowMemberDropdown(true)}
                        onBlur={() => setTimeout(() => setShowMemberDropdown(false), 200)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Rechercher un membre..."
                      />
                      
                      {/* Dropdown */}
                      {showMemberDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {users
                            .filter(u => 
                              !selectedMembers.some(m => m.id === u.id) &&
                              (memberSearch.length === 0 ||
                               u.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                               u.email?.toLowerCase().includes(memberSearch.toLowerCase()))
                            )
                            .slice(0, 10)
                            .map(u => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setSelectedMembers([...selectedMembers, u]);
                                  setMemberSearch('');
                                  setShowMemberDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                              >
                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-indigo-600 font-medium text-xs">
                                    {u.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                  <div className="text-xs text-gray-500">{u.email}</div>
                                </div>
                              </button>
                            ))}
                          {users.filter(u => 
                            !selectedMembers.some(m => m.id === u.id) &&
                            (memberSearch.length === 0 ||
                             u.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                             u.email?.toLowerCase().includes(memberSearch.toLowerCase()))
                          ).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              Aucun membre trouvé
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Recherchez et sélectionnez des membres à ajouter au groupe
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingGroup(null);
                    setFormData({ name: '', description: '', isPublic: false });
                    setSelectedMembers([]);
                    setMemberSearch('');
                    setShowMemberDropdown(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createGroup.isPending || updateGroup.isPending}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {editingGroup ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Membres de {selectedGroup.name}
              </h2>
              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setSelectedGroup(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Current Members */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Membres actuels</h3>
              <div className="space-y-2">
                {selectedGroup.members?.map((memberId) => {
                  const member = users.find(u => u.id === memberId);
                  if (!member) return null;
                  
                  const canRemove = (isAdmin || selectedGroup.createdBy === user?.id) && memberId !== selectedGroup.createdBy;

                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                        {memberId === selectedGroup.createdBy && (
                          <span className="text-xs text-indigo-600 font-medium">Créateur</span>
                        )}
                      </div>
                      {canRemove && (
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setSelectedGroup(null);
                }}
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

export default GroupsPage;

import { useState, useEffect } from 'react';
import PermissionAutocomplete from '../Common/PermissionAutocomplete';
import {
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const WorkflowPermissions = ({ workflowId, currentPermissions, onUpdate }) => {
  const [isPublic, setIsPublic] = useState(currentPermissions?.isPublic || false);
  const [selectedUsers, setSelectedUsers] = useState(currentPermissions?.allowedUsers || []);
  const [selectedGroups, setSelectedGroups] = useState(currentPermissions?.allowedGroups || []);

  useEffect(() => {
    if (currentPermissions) {
      setIsPublic(currentPermissions.isPublic || false);
      setSelectedUsers(currentPermissions.allowedUsers || []);
      setSelectedGroups(currentPermissions.allowedGroups || []);
    }
  }, [currentPermissions]);

  const handleUsersChange = (userIds) => {
    setSelectedUsers(userIds);
    onUpdate({ allowedUsers: userIds, allowedGroups: selectedGroups, isPublic });
  };

  const handleGroupsChange = (groupIds) => {
    setSelectedGroups(groupIds);
    onUpdate({ allowedUsers: selectedUsers, allowedGroups: groupIds, isPublic });
  };

  const handleTogglePublic = () => {
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);
    onUpdate({ allowedUsers: selectedUsers, allowedGroups: selectedGroups, isPublic: newIsPublic });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions du Workflow</h3>
        <p className="text-sm text-gray-500 mb-4">
          Contrôlez qui peut voir et démarrer ce workflow
        </p>
      </div>

      {/* Public Toggle */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="public-workflow"
              type="checkbox"
              checked={isPublic}
              onChange={handleTogglePublic}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="public-workflow" className="flex items-center cursor-pointer">
              <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium text-gray-900">Workflow public</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Tous les utilisateurs peuvent voir et démarrer ce workflow
            </p>
          </div>
        </div>
      </div>

      {/* Users Section */}
      {!isPublic && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h4 className="font-medium text-gray-900">Utilisateurs autorisés</h4>
          </div>
          
          <PermissionAutocomplete
            value={selectedUsers}
            onChange={handleUsersChange}
            type="users"
            placeholder="Rechercher et ajouter des utilisateurs..."
          />
          
          {selectedUsers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} autorisé{selectedUsers.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Groups Section */}
      {!isPublic && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h4 className="font-medium text-gray-900">Groupes autorisés</h4>
          </div>
          
          <PermissionAutocomplete
            value={selectedGroups}
            onChange={handleGroupsChange}
            type="groups"
            placeholder="Rechercher et ajouter des groupes..."
          />
          
          {selectedGroups.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {selectedGroups.length} groupe{selectedGroups.length > 1 ? 's' : ''} autorisé{selectedGroups.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <LockClosedIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Résumé des permissions</h4>
            <p className="text-sm text-blue-700">
              {isPublic ? (
                'Ce workflow est accessible à tous les utilisateurs'
              ) : (
                <>
                  Ce workflow est accessible aux {' '}
                  {selectedUsers.length > 0 && `${selectedUsers.length} utilisateur${selectedUsers.length > 1 ? 's' : ''}`}
                  {selectedUsers.length > 0 && selectedGroups.length > 0 && ' et '}
                  {selectedGroups.length > 0 && `${selectedGroups.length} groupe${selectedGroups.length > 1 ? 's' : ''}`}
                  {selectedUsers.length === 0 && selectedGroups.length === 0 && 'aucun utilisateur (sauf le créateur et les admins)'}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPermissions;

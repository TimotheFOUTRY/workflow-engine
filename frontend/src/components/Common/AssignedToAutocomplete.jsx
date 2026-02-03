import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, UserIcon, UsersIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAssignees } from '../../hooks/useAssignees';

export default function AssignedToAutocomplete({ value = '', onChange, placeholder = 'Sélectionner un utilisateur ou un groupe' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const dropdownRef = useRef(null);
  
  const { data: assigneesData, isLoading } = useAssignees(search, true);
  const assignees = assigneesData?.data || [];

  // Parse initial value
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        setSelectedItems(Array.isArray(parsed) ? parsed : [parsed]);
      } catch {
        // Legacy format: email string
        setSelectedItems([{ type: 'user', value, label: value }]);
      }
    } else {
      setSelectedItems([]);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (assignee) => {
    if (assignee.type === 'group') {
      // Expand group members
      const groupItem = {
        id: assignee.id,
        type: 'group',
        label: assignee.label || assignee.name || 'Groupe sans nom',
        memberIds: assignee.memberIds,
        value: assignee.value
      };
      const newItems = [...selectedItems.filter(item => item.id !== assignee.id), groupItem];
      setSelectedItems(newItems);
      onChange(JSON.stringify(newItems));
    } else {
      // Add user - construct a proper label from firstName + lastName or username
      const displayName = assignee.firstName && assignee.lastName 
        ? `${assignee.firstName} ${assignee.lastName}`
        : assignee.username || assignee.label || assignee.email;
      
      const userItem = {
        id: assignee.id,
        type: 'user',
        label: displayName,
        firstName: assignee.firstName,
        lastName: assignee.lastName,
        username: assignee.username,
        email: assignee.email,
        value: assignee.value || assignee.email
      };
      const newItems = [...selectedItems.filter(item => item.id !== assignee.id), userItem];
      setSelectedItems(newItems);
      onChange(JSON.stringify(newItems));
    }
    setSearch('');
    setIsOpen(false);
  };

  const handleRemove = (item) => {
    const newItems = selectedItems.filter(i => i.id !== item.id);
    setSelectedItems(newItems);
    onChange(newItems.length > 0 ? JSON.stringify(newItems) : '');
  };

  const toggleGroupExpand = (groupId, event) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm"
            >
              {item.type === 'group' ? (
                <UsersIcon className="h-3 w-3" />
              ) : (
                <UserIcon className="h-3 w-3" />
              )}
              <span>{item.label}</span>
              {item.type === 'group' && (
                <span className="text-xs opacity-75">({item.memberIds?.length || 0})</span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Chargement...</div>
          ) : assignees.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
          ) : (
            assignees.map((assignee) => (
              <div key={assignee.id}>
                {assignee.type === 'group' ? (
                  <div className="flex items-center hover:bg-gray-100">
                    <button
                      type="button"
                      onClick={(e) => toggleGroupExpand(assignee.id, e)}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      {expandedGroups.has(assignee.id) ? (
                        <ChevronDownIcon className="h-3 w-3" />
                      ) : (
                        <ChevronRightIcon className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelect(assignee)}
                      className="flex-1 px-2 py-2 text-left flex items-center gap-2"
                    >
                      <UsersIcon className="h-4 w-4 text-indigo-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{assignee.label}</div>
                        <div className="text-xs text-gray-500">
                          {assignee.memberCount} membre{assignee.memberCount > 1 ? 's' : ''} • {assignee.isPublic ? 'Public' : 'Privé'}
                        </div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelect(assignee)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  >
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{assignee.label}</div>
                      <div className="text-xs text-gray-500">{assignee.email}</div>
                    </div>
                  </button>
                )}
                
                {/* Expanded group members */}
                {assignee.type === 'group' && expandedGroups.has(assignee.id) && assignee.members && (
                  <div className="ml-8 border-l-2 border-gray-200">
                    {assignee.members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSelect({
                          id: `user:${member.id}`,
                          type: 'user',
                          label: member.username,
                          email: member.email,
                          value: member.email
                        })}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <UserIcon className="h-3 w-3 text-blue-600" />
                        <div className="flex-1">
                          <div className="text-xs font-medium">{member.username}</div>
                          <div className="text-xs text-gray-400">{member.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

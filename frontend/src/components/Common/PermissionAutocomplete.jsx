import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, UserIcon, UsersIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function PermissionAutocomplete({ 
  value = [], 
  onChange, 
  type = 'users', // 'users' or 'groups'
  placeholder = 'Rechercher...' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Get all items
  const { data: items = [], isLoading } = useQuery({
    queryKey: [type],
    queryFn: async () => {
      const endpoint = type === 'users' ? '/users' : '/groups';
      const response = await api.get(endpoint);
      
      // Handle multiple response formats
      if (Array.isArray(response)) {
        return response;
      }
      if (response.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (response.data[type] && Array.isArray(response.data[type])) {
          return response.data[type];
        }
      }
      return [];
    }
  });

  // Filter items based on search
  const filteredItems = items.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    if (type === 'users') {
      return item.username?.toLowerCase().includes(searchLower) ||
             item.email?.toLowerCase().includes(searchLower);
    } else {
      return item.name?.toLowerCase().includes(searchLower);
    }
  });

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

  const handleSelect = (item) => {
    if (!value.includes(item.id)) {
      onChange([...value, item.id]);
    }
    setSearch('');
    setIsOpen(false);
  };

  const handleRemove = (itemId) => {
    onChange(value.filter(id => id !== itemId));
  };

  // Get selected items details
  const selectedItems = value
    .map(id => items.find(item => item.id === id))
    .filter(Boolean);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
            >
              {type === 'groups' ? (
                <UsersIcon className="h-3 w-3" />
              ) : (
                <UserIcon className="h-3 w-3" />
              )}
              <span>
                {type === 'users' ? item.username : item.name}
              </span>
              {type === 'groups' && item.members && (
                <span className="text-xs opacity-75">({item.members.length})</span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Chargement...</div>
          ) : filteredItems.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {search ? 'Aucun résultat' : 'Aucun élément disponible'}
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = value.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !isSelected && handleSelect(item)}
                  disabled={isSelected}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm ${
                    isSelected
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  {type === 'groups' ? (
                    <UsersIcon className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <UserIcon className="h-4 w-4 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {type === 'users' ? item.username : item.name}
                    </div>
                    {type === 'users' && item.email && (
                      <div className="text-xs text-gray-500 truncate">{item.email}</div>
                    )}
                    {type === 'groups' && item.members && (
                      <div className="text-xs text-gray-500">
                        {item.members.length} membre{item.members.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-xs text-gray-500">Sélectionné</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

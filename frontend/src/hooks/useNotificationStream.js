import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to manage SSE connection for real-time notifications
 * Automatically reconnects on disconnect
 */
export const useNotificationStream = (onNotification) => {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const queryClient = useQueryClient();
  const isConnectingRef = useRef(false);
  const onNotificationRef = useRef(onNotification);

  // Update ref when callback changes
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);
  
  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('Connection attempt already in progress, skipping...');
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found, cannot connect to notification stream');
      return;
    }

    isConnectingRef.current = true;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource with auth token in URL
    // Use same base URL as axios API (includes /api)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const url = `${baseUrl}/notifications/stream?token=${token}`;
    
    console.log('Connecting to notification stream...');
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Connected to notification stream');
      isConnectingRef.current = false;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('Notification stream ready:', data.message);
          return;
        }

        if (data.type === 'notification' && data.data) {
          console.log('📬 New notification received:', data.data);
          
          // Call custom handler if provided
          if (onNotificationRef.current) {
            onNotificationRef.current(data.data);
          }

          // Invalidate React Query caches to refresh notification list and count
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(data.data.title, {
              body: data.data.message,
              icon: '/favicon.ico',
              tag: data.data.id
            });
          }
        }
      } catch (error) {
        console.error('Error parsing notification event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Notification stream error:', error);
      isConnectingRef.current = false;
      eventSource.close();
      
      // Attempt to reconnect after 5 seconds
      console.log('Reconnecting in 5 seconds...');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };

  }, [queryClient]); // Removed onNotification from dependencies to avoid reconnections

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }

    // Connect to SSE stream
    connect();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        console.log('Closing notification stream...');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    reconnect: connect
  };
};

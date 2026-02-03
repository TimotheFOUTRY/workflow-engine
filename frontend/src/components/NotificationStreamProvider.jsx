import { useEffect } from 'react';
import { useNotificationStream } from '../hooks';
import { useAuth } from '../context/AuthContext';

/**
 * Component to initialize real-time notification stream
 * Only connects when user is authenticated
 */
const NotificationStreamProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Handler for new notifications (optional - for custom behavior)
  const handleNotification = (notification) => {
    console.log('New notification received:', notification);
    // You can add custom behavior here, like playing a sound
  };

  // Connect to notification stream if user is logged in
  useNotificationStream(user ? handleNotification : null);

  return children;
};

export default NotificationStreamProvider;

import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { useNotifications } from '../../hooks';
import { useState, useEffect } from 'react';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  // Animate bell when unread count increases
  useEffect(() => {
    if (unreadCount > prevCount && prevCount > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
    setPrevCount(unreadCount);
  }, [unreadCount, prevCount]);

  return (
    <Link
      to="/notifications"
      className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      title={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
    >
      {unreadCount > 0 ? (
        <BellAlertIcon 
          className={`h-6 w-6 text-blue-600 ${isAnimating ? 'animate-bounce' : ''}`}
        />
      ) : (
        <BellIcon className="h-6 w-6" />
      )}
      {unreadCount > 0 && (
        <span 
          className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px] ${
            isAnimating ? 'animate-pulse' : ''
          }`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;

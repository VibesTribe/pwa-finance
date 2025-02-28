// notification-component.js
import React, { useState } from 'react';
import { useNotifications } from './notification-context';

const NotificationComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };
  
  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'budget':
        return '💰';
      case 'shared':
        return '👥';
      case 'report':
        return '📊';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  return (
    <div className="notification-container">
      <button 
        className="notification-bell" 
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read" 
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {isLoading ? (
              <div className="notification-loading">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">You have no notifications</div>
            ) : (
              notifications
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(notification => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationTypeIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <small>
                        {notification.createdAt && new Date(notification.createdAt.toDate()).toLocaleString()}
                      </small>
                    </div>
                    {!notification.read && (
                      <div className="notification-unread-indicator"></div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;
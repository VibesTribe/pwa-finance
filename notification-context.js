// notification-context.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from './firebase-config-updated';

// Create notification context
const NotificationContext = createContext();

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: true,
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(notif => !notif.read).length,
        isLoading: false,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => 
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
        unreadCount: state.unreadCount - 1,
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  useEffect(() => {
    // Only fetch notifications if a user is logged in
    if (!auth.currentUser) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Set up real-time listener for notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', auth.currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notificationsData });
    }, (error) => {
      console.error('Error fetching notifications:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [auth.currentUser]);
  
  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (state.notifications.length === 0) return;
      
      // Update all unread notifications in firestore
      const batch = db.batch();
      state.notifications.forEach(notif => {
        if (!notif.read) {
          const notifRef = doc(db, 'notifications', notif.id);
          batch.update(notifRef, { read: true });
        }
      });
      
      await batch.commit();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Create a notification (utility function to be used in other contexts)
  const createNotification = async (type, title, message, userId) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        type, // 'budget', 'shared', 'report', 'system'
        title,
        message,
        userId: userId || auth.currentUser.uid,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };
  
  return (
    <NotificationContext.Provider 
      value={{ 
        ...state, 
        markAsRead, 
        markAllAsRead,
        createNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using the notification context
export const useNotifications = () => useContext(NotificationContext);
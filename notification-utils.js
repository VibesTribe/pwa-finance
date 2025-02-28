// notification-utils.js
import { useNotifications } from './notification-context';
import { db, auth } from './firebase-config-updated';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const useBudgetAlerts = () => {
  const { createNotification } = useNotifications();
  
  const checkBudgetThresholds = async (category, amount, userId = auth.currentUser?.uid) => {
    if (!userId) return;
    
    try {
      // Get user budget settings
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return;
      
      const userData = userSnap.data();
      const budgets = userData.budgets || {};
      
      // If budget exists for category
      if (budgets[category]) {
        const budget = budgets[category];
        const spent = budget.spent + amount;
        const limit = budget.limit;
        
        // Calculate percentage of budget used
        const percentage = (spent / limit) * 100;
        
        // Alert at 80% of budget
        if (percentage >= 80 && percentage < 100 && !budget.warningAlertSent) {
          await createNotification(
            'budget',
            'Budget Warning',
            `You've used ${percentage.toFixed(0)}% of your ${category} budget.`,
            userId
          );
          
          // Update flag to prevent duplicate alerts
          const updatedBudgets = { ...budgets };
          updatedBudgets[category].warningAlertSent = true;
          await updateDoc(userRef, { budgets: updatedBudgets });
        }
        
        // Alert at 100% of budget
        if (percentage >= 100 && !budget.limitAlertSent) {
          await createNotification(
            'budget',
            'Budget Limit Reached',
            `You've reached your ${category} budget limit.`,
            userId
          );
          
          // Update flag to prevent duplicate alerts
          const updatedBudgets = { ...budgets };
          updatedBudgets[category].limitAlertSent = true;
          await updateDoc(userRef, { budgets: updatedBudgets });
        }
      }
    } catch (error) {
      console.error('Error checking budget thresholds:', error);
    }
  };
  
  return { checkBudgetThresholds };
};

export const useSharedExpenseReminders = () => {
  const { createNotification } = useNotifications();
  
  const sendPaymentReminder = async (expense, recipientUserId) => {
    try {
      // Get recipient user info
      const userRef = doc(db, 'users', recipientUserId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return;
      
      const userData = userSnap.data();
      const userName = userData.displayName || userData.email;
      
      await createNotification(
        'shared',
        'Payment Reminder',
        `Reminder: You owe ${expense.amount.toFixed(2)} for "${expense.description}" to ${userName}.`,
        recipientUserId
      );
    } catch (error) {
      console.error('Error sending payment reminder:', error);
    }
  };
  
  const sendPendingExpensesReminder = async (userId = auth.currentUser?.uid) => {
    if (!userId) return;
    
    try {
      // Find shared expenses that are pending
      const expensesRef = collection(db, 'transactions');
      const q = query(
        expensesRef, 
        where('isShared', '==', true),
        where('paymentStatus', '==', 'pending'),
        where('sharedWith', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return;
      
      const pendingCount = snapshot.size;
      
      await createNotification(
        'shared',
        'Pending Shared Expenses',
        `You have ${pendingCount} pending shared expense${pendingCount > 1 ? 's' : ''} to review.`,
        userId
      );
    } catch (error) {
      console.error('Error sending pending expenses reminder:', error);
    }
  };
  
  return { sendPaymentReminder, sendPendingExpensesReminder };
};

export const useReportNotifications = () => {
  const { createNotification } = useNotifications();
  
  const sendReportReadyNotification = async (reportType, userId = auth.currentUser?.uid) => {
    if (!userId) return;
    
    try {
      await createNotification(
        'report',
        'Report Ready',
        `Your ${reportType} report is now available to view.`,
        userId
      );
    } catch (error) {
      console.error('Error sending report notification:', error);
    }
  };
  
  const sendWeeklyReportReminder = async (userId = auth.currentUser?.uid) => {
    if (!userId) return;
    
    try {
      await createNotification(
        'report',
        'Weekly Report Reminder',
        'Your weekly financial report is ready to review.',
        userId
      );
    } catch (error) {
      console.error('Error sending weekly report reminder:', error);
    }
  };
  
  return { sendReportReadyNotification, sendWeeklyReportReminder };
};
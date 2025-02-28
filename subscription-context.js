// subscription-context.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase-config-updated';

// Define subscription tiers and features
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  BUSINESS: 'business'
};

export const FEATURES = {
  BASIC_TRACKING: 'basic_tracking',               // Free
  REPORTS_BASIC: 'reports_basic',                 // Free
  SHARED_EXPENSES: 'shared_expenses',             // Free
  RECEIPT_UPLOAD_BASIC: 'receipt_upload_basic',   // Free (limited)
  
  AI_RECEIPT_SCANNING: 'ai_receipt_scanning',     // Premium
  ADVANCED_REPORTS: 'advanced_reports',           // Premium
  RECURRING_TRANSACTIONS: 'recurring_transactions', // Premium
  BUDGET_ALERTS: 'budget_alerts',                 // Premium
  EXPORT_OPTIONS: 'export_options',               // Premium
  
  BUSINESS_CATEGORIES: 'business_categories',     // Business
  TAX_REPORTS: 'tax_reports',                     // Business
  MULTI_USER_ACCESS: 'multi_user_access',         // Business
  INVOICE_TRACKING: 'invoice_tracking',           // Business
};

// Define which features are available in which tier
const TIER_FEATURES = {
  [SUBSCRIPTION_TIERS.FREE]: [
    FEATURES.BASIC_TRACKING,
    FEATURES.REPORTS_BASIC,
    FEATURES.SHARED_EXPENSES,
    FEATURES.RECEIPT_UPLOAD_BASIC,
  ],
  [SUBSCRIPTION_TIERS.PREMIUM]: [
    FEATURES.BASIC_TRACKING,
    FEATURES.REPORTS_BASIC,
    FEATURES.SHARED_EXPENSES,
    FEATURES.RECEIPT_UPLOAD_BASIC,
    FEATURES.AI_RECEIPT_SCANNING,
    FEATURES.ADVANCED_REPORTS,
    FEATURES.RECURRING_TRANSACTIONS,
    FEATURES.BUDGET_ALERTS,
    FEATURES.EXPORT_OPTIONS,
  ],
  [SUBSCRIPTION_TIERS.BUSINESS]: [
    FEATURES.BASIC_TRACKING,
    FEATURES.REPORTS_BASIC,
    FEATURES.SHARED_EXPENSES,
    FEATURES.RECEIPT_UPLOAD_BASIC,
    FEATURES.AI_RECEIPT_SCANNING,
    FEATURES.ADVANCED_REPORTS,
    FEATURES.RECURRING_TRANSACTIONS,
    FEATURES.BUDGET_ALERTS,
    FEATURES.EXPORT_OPTIONS,
    FEATURES.BUSINESS_CATEGORIES,
    FEATURES.TAX_REPORTS,
    FEATURES.MULTI_USER_ACCESS,
    FEATURES.INVOICE_TRACKING,
  ],
};

// Create context
const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [userTier, setUserTier] = useState(SUBSCRIPTION_TIERS.FREE);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user's subscription info when authenticated
  useEffect(() => {
    const loadSubscriptionInfo = async () => {
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserTier(userData.subscriptionTier || SUBSCRIPTION_TIERS.FREE);
        } else {
          // Create user document if it doesn't exist
          await updateDoc(userDocRef, {
            subscriptionTier: SUBSCRIPTION_TIERS.FREE,
            subscriptionExpiry: null,
          });
          setUserTier(SUBSCRIPTION_TIERS.FREE);
        }
      } catch (error) {
        console.error('Error loading subscription info:', error);
        setUserTier(SUBSCRIPTION_TIERS.FREE); // Default to free if error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscriptionInfo();
  }, [auth.currentUser]);
  
  // Check if a feature is available for the user's tier
  const hasFeature = (featureKey) => {
    return TIER_FEATURES[userTier]?.includes(featureKey) || false;
  };
  
  // Upgrade subscription tier
  const upgradeSubscription = async (newTier) => {
    if (!auth.currentUser) return false;
    
    try {
      // In a real app, this would interact with a payment processor
      // For demo purposes, we'll just update the tier directly
      
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        subscriptionTier: newTier,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
      
      setUserTier(newTier);
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
    }
  };
  
  return (
    <SubscriptionContext.Provider
      value={{
        userTier,
        isLoading,
        hasFeature,
        upgradeSubscription,
        SUBSCRIPTION_TIERS,
        FEATURES,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
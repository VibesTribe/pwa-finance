// ai-service.js
import { storage, db, auth } from './firebase-config-updated';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// This service will be a placeholder for future AI integration
// When ready, you can replace these placeholders with actual AI API calls

export const AiService = {
  // Process receipt image
  async processReceiptImage(imageFile) {
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `receipts/${auth.currentUser.uid}/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);
      
      // In the future, this would call your AI API
      // For now, we'll simulate a processing delay and return placeholder data
      
      // Simulate API call with timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          // Placeholder receipt data
          resolve({
            status: 'success',
            receiptUrl: imageUrl,
            extractedData: {
              merchant: 'Unknown Merchant',
              date: new Date(),
              total: 0,
              items: [],
              taxAmount: 0,
              receiptId: `r-${Date.now()}`,
            },
            // Flag to indicate this is placeholder data
            isPlaceholder: true,
          });
        }, 2000); // Simulate 2-second processing time
      });
    } catch (error) {
      console.error('Error processing receipt image:', error);
      throw error;
    }
  },
  
  // Save processed receipt to database
  async saveProcessedReceipt(receiptData, transactionId = null) {
    try {
      if (!auth.currentUser) throw new Error('User not authenticated');
      
      const receiptDataToSave = {
        ...receiptData,
        userId: auth.currentUser.uid,
        processedAt: serverTimestamp(),
        transactionId,
      };
      
      // Save to receipts collection
      const receiptRef = await addDoc(collection(db, 'receipts'), receiptDataToSave);
      
      // If this receipt is linked to a transaction, update the transaction
      if (transactionId) {
        const transactionRef = doc(db, 'transactions', transactionId);
        await updateDoc(transactionRef, {
          receiptId: receiptRef.id,
          hasReceipt: true,
        });
      }
      
      return receiptRef.id;
    } catch (error) {
      console.error('Error saving processed receipt:', error);
      throw error;
    }
  },
  
  // Categorize transaction using AI
  async categorizeTransaction(description, amount) {
    try {
      // In the future, this would call your AI API for smart categorization
      // For now, we'll simulate with basic logic based on keywords
      
      const description_lower = description.toLowerCase();
      
      // Very basic keyword matching - in real app, the AI would be much smarter
      if (description_lower.includes('grocery') || description_lower.includes('supermarket')) {
        return 'Groceries';
      } else if (description_lower.includes('restaurant') || description_lower.includes('cafe')) {
        return 'Dining';
      } else if (description_lower.includes('gas') || description_lower.includes('fuel')) {
        return 'Transportation';
      } else if (description_lower.includes('doctor') || description_lower.includes('pharmacy')) {
        return 'Healthcare';
      } else if (description_lower.includes('rent') || description_lower.includes('mortgage')) {
        return 'Housing';
      } else if (description_lower.includes('internet') || description_lower.includes('phone')) {
        return 'Utilities';
      } else {
        return 'Miscellaneous';
      }
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return 'Uncategorized';
    }
  },
  
  // Get spending insights
  async getSpendingInsights(userId = auth.currentUser?.uid, timeframe = 'month') {
    // This would eventually use AI to analyze spending patterns
    // For now, just return placeholder insights
    
    return {
      topCategories: [
        { category: 'Dining', percentage: 30, change: +5 },
        { category: 'Groceries', percentage: 25, change: -2 },
        { category: 'Entertainment', percentage: 15, change: +8 },
      ],
      anomalies: [
        { 
          category: 'Dining', 
          message: 'Your dining expenses are 30% higher than usual this month.' 
        },
      ],
      recommendations: [
        'Consider cooking at home more to reduce dining expenses.',
        'Your grocery spending is well managed this month.',
        'Look for free entertainment options to reduce that category.',
      ],
      // Flag to indicate this is placeholder data
      isPlaceholder: true,
    };
  },
};

export default AiService;
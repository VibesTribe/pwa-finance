// ai-insights-component.js
import React, { useState, useEffect } from 'react';
import { AiService } from './ai-service';
import { useSubscription, FEATURES } from './subscription-context';
import FeatureGate from './feature-gate';

const AiInsightsComponent = () => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hasFeature } = useSubscription();
  
  useEffect(() => {
    const loadInsights = async () => {
      if (!hasFeature(FEATURES.ADVANCED_REPORTS)) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const data = await AiService.getSpendingInsights();
        setInsights(data);
      } catch (error) {
        console.error('Error loading AI insights:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInsights();
  }, [hasFeature]);
  
  if (isLoading) {
    return <div className="ai-insights-loading">Loading AI insights...</div>;
  }
  
  return (
    <FeatureGate feature={FEATURES.ADVANCED_REPORTS}>
      <div className="ai-insights-container">
        <div className="ai-insights-header">
          <h2>Smart Financial Insights</h2>
          {insights?.isPlaceholder && (
            <span className="placeholder-indicator">
              AI features are in development. These are placeholder insights.
            </span>
          )}
        </div>
        
        {insights && (
          <>
            <div className="insights-section">
              <h3>Top Spending Categories</h3>
              <div className="categories-list">
                {insights.topCategories.map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-name">{category.category}</div>
                    <div className="category-percentage">{category.percentage}%</div>
                    <div className={`category-change ${category.change >= 0 ? 'positive' : 'negative'}`}>
                      {category.change > 0 ? '+' : ''}{category.change}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="insights-section">
              <h3>Unusual Spending Patterns</h3>
              {insights.anomalies.length > 0 ? (
                <ul className="anomalies-list">
                  {insights.anomalies.map((anomaly, index) => (
                    <li key={index} className="anomaly-item">
                      <span className="anomaly-category">{anomaly.category}:</span> {anomaly.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No unusual spending patterns detected this month.</p>
              )}
            </div>
            
            <div className="insights-section">
              <h3>AI Recommendations</h3>
              <ul className="recommendations-list">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="recommendation-item">{recommendation}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        
        <div className="ai-disclaimer">
          These insights are generated using AI analysis of your spending patterns and are intended as suggestions only. Please review your financial situation thoroughly before making decisions.
        </div>
        
        <div className="ai-actions">
          <h3>Take Action</h3>
          <div className="actions-list">
            {insights?.suggestedActions && insights.suggestedActions.map((action, index) => (
              <button 
                key={index} 
                className="action-button"
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="ai-feedback">
          <h3>Was this helpful?</h3>
          <div className="feedback-buttons">
            <button 
              className="feedback-button"
              onClick={() => handleFeedback('helpful')}
            >
              👍 Yes
            </button>
            <button 
              className="feedback-button"
              onClick={() => handleFeedback('not-helpful')}
            >
              👎 No
            </button>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
  
  function handleActionClick(action) {
    // This would be implemented to handle different AI-suggested actions
    console.log('Action clicked:', action);
    
    // Example implementation:
    switch(action.type) {
      case 'CREATE_BUDGET':
        // Navigate to budget creation
        window.location.href = '/budgets/new';
        break;
      case 'OPTIMIZE_SPENDING':
        // Open spending optimization modal
        // This would be integrated with a modal system
        break;
      case 'REVIEW_SUBSCRIPTIONS':
        // Navigate to subscriptions page
        window.location.href = '/subscriptions';
        break;
      default:
        console.log('Unknown action type:', action.type);
    }
  }
  
  function handleFeedback(type) {
    // Log feedback to improve AI recommendations
    console.log('Feedback received:', type);
    
    // Example implementation:
    AiService.submitFeedback({
      type,
      insightsId: insights?.id,
      timestamp: new Date().toISOString()
    }).then(() => {
      // Show feedback confirmation
      alert('Thank you for your feedback!');
    }).catch(error => {
      console.error('Error submitting feedback:', error);
    });
  }
};

export default AiInsightsComponent;

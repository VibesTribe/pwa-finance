// feature-gate.js
import React from 'react';
import { useSubscription } from './subscription-context';

const FeatureGate = ({ feature, fallback, children }) => {
  const { hasFeature, isLoading, userTier } = useSubscription();
  
  if (isLoading) {
    return <div className="loading-feature">Loading...</div>;
  }
  
  if (hasFeature(feature)) {
    return children;
  }
  
  // Default fallback if none provided
  const defaultFallback = (
    <div className="feature-upgrade-prompt">
      <p>This feature requires a higher subscription tier.</p>
      <a href="/subscription">Upgrade your subscription</a>
    </div>
  );
  
  return fallback || defaultFallback;
};

export default FeatureGate;
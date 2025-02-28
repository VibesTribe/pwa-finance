// subscription-page.js
import React from 'react';
import { useSubscription, SUBSCRIPTION_TIERS } from './subscription-context';

const SubscriptionPage = () => {
  const { 
    userTier, 
    upgradeSubscription, 
    isLoading,
    FEATURES
  } = useSubscription();
  
  if (isLoading) {
    return <div className="loading">Loading subscription information...</div>;
  }
  
  const handleUpgrade = async (tier) => {
    // In a real app, this would redirect to a payment page first
    const success = await upgradeSubscription(tier);
    if (success) {
      alert(`Successfully upgraded to ${tier} plan!`);
    } else {
      alert('Failed to upgrade. Please try again later.');
    }
  };
  
  const plans = [
    {
      tier: SUBSCRIPTION_TIERS.FREE,
      name: 'Free',
      price: '$0/month',
      description: 'Basic personal finance tracking',
      features: [
        'Track personal expenses',
        'Basic reporting',
        'Share expenses with friends',
        'Limited receipt uploads (5/month)',
      ],
      current: userTier === SUBSCRIPTION_TIERS.FREE,
    },
    {
      tier: SUBSCRIPTION_TIERS.PREMIUM,
      name: 'Premium',
      price: '$4.99/month',
      description: 'Advanced personal finance management',
      features: [
        'Everything in Free',
        'AI Receipt Scanning',
        'Advanced reports and analytics',
        'Recurring transactions',
        'Budget alerts',
        'Export to PDF/CSV',
        'Unlimited receipt uploads',
      ],
      current: userTier === SUBSCRIPTION_TIERS.PREMIUM,
    },
    {
      tier: SUBSCRIPTION_TIERS.BUSINESS,
      name: 'Business',
      price: '$9.99/month',
      description: 'Complete business & personal finance solution',
      features: [
        'Everything in Premium',
        'Business categories',
        'Tax reports',
        'Multi-user access',
        'Invoice tracking',
        'Priority support',
      ],
      current: userTier === SUBSCRIPTION_TIERS.BUSINESS,
    },
  ];
  
  return (
    <div className="subscription-page">
      <h1>Choose Your Plan</h1>
      <p className="current-plan">
        Your current plan: <strong>{userTier.toUpperCase()}</strong>
      </p>
      
      <div className="plans-container">
        {plans.map((plan) => (
          <div 
            key={plan.tier}
            className={`plan-card ${plan.current ? 'current-plan' : ''}`}
          >
            <div className="plan-header">
              <h2>{plan.name}</h2>
              <p className="plan-price">{plan.price}</p>
            </div>
            
            <p className="plan-description">{plan.description}</p>
            
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            
            {plan.current ? (
              <button className="current-plan-button" disabled>Current Plan</button>
            ) : (
              <button 
                className="upgrade-button"
                onClick={() => handleUpgrade(plan.tier)}
              >
                {userTier === SUBSCRIPTION_TIERS.FREE ? 'Upgrade' : 'Switch'} to {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
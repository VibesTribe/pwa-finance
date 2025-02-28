import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/protected-route';
import ReportGenerator from '../components/report-generator';
import ReportSummary from '../components/report-summary';

const ReportRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-8">Reports</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-2">Custom Reports</h2>
                <p className="text-gray-600 mb-4">Generate customized reports with filters for dates, categories, and account types.</p>
                <a 
                  href="/reports/custom" 
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Generate Report
                </a>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-2">Summary Reports</h2>
                <p className="text-gray-600 mb-4">View weekly and monthly summaries of your financial activity.</p>
                <a 
                  href="/reports/summary" 
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Summaries
                </a>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/custom" element={
        <ProtectedRoute>
          <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-8">Custom Report Generator</h1>
            <ReportGenerator />
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/summary" element={
        <ProtectedRoute>
          <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-8">Financial Summaries</h1>
            <ReportSummary />
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default ReportRoutes;

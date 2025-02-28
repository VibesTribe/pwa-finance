import React, { useState, useEffect, useContext } from 'react';
import { TransactionContext } from '../contexts/transaction-context';
import { AuthContext } from '../contexts/auth-context';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  CardTitle,
  CardDescription 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { DatePicker } from '../components/ui/date-picker';
import { Checkbox } from '../components/ui/checkbox';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { exportToCsv } from '../utils/export-utils';

const ReportGenerator = () => {
  const { currentUser } = useContext(AuthContext);
  const { transactions } = useContext(TransactionContext);
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportType, setReportType] = useState('all');
  const [accountType, setAccountType] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  
  // Extract unique categories from transactions
  useEffect(() => {
    if (transactions.length > 0) {
      const uniqueCategories = [...new Set(transactions.map(t => t.category))];
      setCategories(uniqueCategories);
    }
  }, [transactions]);
  
  // Filter transactions based on selected criteria
  useEffect(() => {
    if (!transactions.length) return;
    
    let filtered = [...transactions];
    
    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => {
        const transDate = new Date(t.date).getTime();
        return transDate >= start && transDate <= end;
      });
    }
    
    // Filter by account type
    if (accountType !== 'all') {
      filtered = filtered.filter(t => t.accountType === accountType);
    }
    
    // Filter by categories if any are selected
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category));
    }
    
    // Filter by transaction type
    if (reportType === 'income') {
      filtered = filtered.filter(t => t.type === 'income');
    } else if (reportType === 'expense') {
      filtered = filtered.filter(t => t.type === 'expense');
    }
    
    setFilteredTransactions(filtered);
    
    // Generate preview data
    generatePreviewData(filtered);
  }, [startDate, endDate, reportType, accountType, selectedCategories, transactions]);
  
  // Generate summary data for preview
  const generatePreviewData = (data) => {
    if (!data.length) {
      setPreviewData(null);
      return;
    }
    
    const summary = {
      totalTransactions: data.length,
      totalIncome: data.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      totalExpenses: data.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      categoryBreakdown: {},
      dateRange: {
        start: startDate ? new Date(startDate).toLocaleDateString() : 'All time',
        end: endDate ? new Date(endDate).toLocaleDateString() : 'All time'
      }
    };
    
    // Calculate category breakdown
    data.forEach(t => {
      if (!summary.categoryBreakdown[t.category]) {
        summary.categoryBreakdown[t.category] = {
          count: 0,
          total: 0
        };
      }
      
      summary.categoryBreakdown[t.category].count += 1;
      summary.categoryBreakdown[t.category].total += parseFloat(t.amount);
    });
    
    setPreviewData(summary);
  };
  
  // Handle category selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  // Generate PDF report
  const generatePdfReport = () => {
    if (!filteredTransactions.length) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Financial Report', 14, 22);
    
    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Date Range: ${previewData.dateRange.start} to ${previewData.dateRange.end}`, 
      14, 
      32
    );
    
    // Add account type
    doc.text(
      `Account Type: ${accountType === 'all' ? 'All Accounts' : 
        accountType === 'personal' ? 'Personal' : 'Business'}`,
      14,
      40
    );
    
    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary', 14, 50);
    doc.setFontSize(12);
    doc.text(`Total Transactions: ${previewData.totalTransactions}`, 14, 60);
    doc.text(
      `Total Income: $${previewData.totalIncome.toFixed(2)}`, 
      14, 
      68
    );
    doc.text(
      `Total Expenses: $${previewData.totalExpenses.toFixed(2)}`, 
      14, 
      76
    );
    doc.text(
      `Net: $${(previewData.totalIncome - previewData.totalExpenses).toFixed(2)}`,
      14,
      84
    );
    
    // Add transaction table
    doc.setFontSize(14);
    doc.text('Transactions', 14, 100);
    
    // Create transaction data for table
    const tableData = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.type === 'income' ? 'Income' : 'Expense',
      `$${parseFloat(t.amount).toFixed(2)}`,
      t.accountType === 'personal' ? 'Personal' : 'Business'
    ]);
    
    doc.autoTable({
      startY: 110,
      head: [['Date', 'Description', 'Category', 'Type', 'Amount', 'Account']],
      body: tableData,
    });
    
    // Add category breakdown
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Category Breakdown', 14, finalY);
    
    const categoryData = Object.entries(previewData.categoryBreakdown).map(
      ([category, data]) => [
        category,
        data.count,
        `$${data.total.toFixed(2)}`
      ]
    );
    
    doc.autoTable({
      startY: finalY + 10,
      head: [['Category', 'Count', 'Total Amount']],
      body: categoryData,
    });
    
    // Add footer with date
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} by ${currentUser.displayName || currentUser.email}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Save the PDF
    doc.save(`financial-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  // Generate CSV report
  const generateCsvReport = () => {
    if (!filteredTransactions.length) return;
    
    // Prepare data for CSV
    const csvData = filteredTransactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Category: t.category,
      Type: t.type === 'income' ? 'Income' : 'Expense',
      Amount: parseFloat(t.amount).toFixed(2),
      Account: t.accountType === 'personal' ? 'Personal' : 'Business',
      Shared: t.isShared ? 'Yes' : 'No',
      PaymentStatus: t.isShared ? t.paymentStatus : 'N/A'
    }));
    
    // Export to CSV
    exportToCsv(
      csvData, 
      `financial-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Financial Report</CardTitle>
        <CardDescription>
          Customize and export your financial data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Date Range Selection */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-medium">Date Range</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm">Start Date</label>
              <DatePicker 
                date={startDate} 
                setDate={setStartDate} 
                className="w-full" 
              />
            </div>
            <div className="flex-1">
              <label className="text-sm">End Date</label>
              <DatePicker 
                date={endDate} 
                setDate={setEndDate} 
                className="w-full" 
              />
            </div>
          </div>
        </div>
        
        {/* Report Type & Account Selection */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Report Type</h3>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
                <SelectItem value="expense">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Account Type</h3>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="personal">Personal Only</SelectItem>
                <SelectItem value="business">Business Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label 
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Report Preview */}
        {previewData && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Report Preview</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Transactions:</strong> {previewData.totalTransactions}</p>
              <p><strong>Total Income:</strong> ${previewData.totalIncome.toFixed(2)}</p>
              <p><strong>Total Expenses:</strong> ${previewData.totalExpenses.toFixed(2)}</p>
              <p><strong>Net:</strong> ${(previewData.totalIncome - previewData.totalExpenses).toFixed(2)}</p>
              <p><strong>Date Range:</strong> {previewData.dateRange.start} to {previewData.dateRange.end}</p>
              <p><strong>Account Type:</strong> {accountType === 'all' ? 'All Accounts' : 
                accountType === 'personal' ? 'Personal' : 'Business'}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="text-sm text-gray-500">
          {filteredTransactions.length 
            ? `${filteredTransactions.length} transactions found`
            : 'No transactions match your criteria'}
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={generateCsvReport}
            disabled={!filteredTransactions.length}
          >
            Export CSV
          </Button>
          <Button 
            onClick={generatePdfReport}
            disabled={!filteredTransactions.length}
          >
            Export PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReportGenerator;

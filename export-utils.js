/**
 * Utility functions for exporting data in various formats
 */

/**
 * Exports data to a CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file to save
 */
export const exportToCsv = (data, filename) => {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }
  
  // Get headers from first data object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    // Header row
    headers.join(','),
    
    // Data rows
    ...data.map(row => {
      return headers.map(header => {
        // Escape values that contain commas or quotes
        const value = row[header] === null || row[header] === undefined ? '' : row[header];
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    })
  ];
  
  // Join rows with newlines to create CSV content
  const csvContent = csvRows.join('\n');
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Set link attributes
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    
    // Append to body (required for Firefox)
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Fallback for browsers that don't support download attribute
    console.error('Your browser does not support the download attribute');
  }
};

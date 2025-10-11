import React from 'react';

// Modern loading spinner component
const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Skeleton loading component for cards
const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
  </div>
);

// Skeleton loading for table rows
const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-4 py-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

// Full page loading component
const FullPageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
      <p className="text-lg text-gray-600 font-medium">{text}</p>
      <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data...</p>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ title = 'Something went wrong', message, onRetry, className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {message && <p className="text-sm text-gray-600 mb-4 text-center max-w-md">{message}</p>}
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Empty state component
const EmptyState = ({ 
  icon, 
  title = 'No data found', 
  message = 'There are no items to display at the moment.', 
  action,
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    {icon && <div className="h-16 w-16 text-gray-400 mb-4">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4 text-center max-w-md">{message}</p>
    {action && action}
  </div>
);

export { 
  LoadingSpinner, 
  SkeletonCard, 
  SkeletonTableRow, 
  FullPageLoader, 
  ErrorState, 
  EmptyState 
};

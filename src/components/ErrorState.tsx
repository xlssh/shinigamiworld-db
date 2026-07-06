import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message = "An error occurred while loading data.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-xl max-w-xl mx-auto my-8 animate-fade-in">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <h3 className="mt-4 text-lg font-semibold text-red-900 dark:text-red-200">Error Loading Data</h3>
      <p className="mt-2 text-sm text-red-700 dark:text-red-400 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

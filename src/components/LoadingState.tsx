import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = "Loading game data…" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] animate-fade-in">
      {/* Animated loading indicator */}
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-4 border-brand/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-brand/40 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-sm text-muted font-medium text-center max-w-xs">{message}</p>
      {/* Skeleton preview lines */}
      <div className="mt-6 w-full max-w-sm space-y-2">
        <div className="h-2 bg-surface rounded-full animate-pulse"></div>
        <div className="h-2 bg-surface rounded-full animate-pulse w-3/4"></div>
        <div className="h-2 bg-surface rounded-full animate-pulse w-1/2"></div>
      </div>
    </div>
  );
};

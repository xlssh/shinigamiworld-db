import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = "Loading game data…" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium">{message}</p>
    </div>
  );
};


import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          404
        </h1>
        <p className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">
          Page not found
        </p>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button>
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

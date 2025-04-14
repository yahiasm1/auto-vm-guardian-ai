
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <h1 className="text-6xl font-extrabold mb-6">404</h1>
      <p className="text-2xl font-medium mb-8">Page not found</p>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <Link to="/">
        <Button className="bg-vmSystem-blue hover:bg-vmSystem-blue-dark">
          Return to Home
        </Button>
      </Link>
    </div>
  );
}


import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-vmSystem-blue dark:text-vmSystem-blue-light">
            Create an Account
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Register for VM Guardian
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <p className="text-center mb-6 text-slate-600 dark:text-slate-400">
            Registration is currently available through your institution's administrator.
          </p>
          
          <div className="flex flex-col space-y-4">
            <Link to="/login">
              <Button className="w-full" variant="outline">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

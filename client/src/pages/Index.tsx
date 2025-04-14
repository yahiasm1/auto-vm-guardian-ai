
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-4xl p-6 mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight text-vmSystem-blue dark:text-vmSystem-blue-light mb-4">
          VM Guardian AI
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
          Intelligent virtual machine management for educational environments
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin">
                  <Button size="lg" className="bg-vmSystem-blue hover:bg-vmSystem-blue-dark">
                    Go to Admin Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/student">
                  <Button size="lg" className="bg-vmSystem-blue hover:bg-vmSystem-blue-dark">
                    Go to Student Portal
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login">
                <Button size="lg" className="bg-vmSystem-blue hover:bg-vmSystem-blue-dark">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

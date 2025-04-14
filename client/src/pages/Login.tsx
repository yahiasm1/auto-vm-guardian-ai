
import { LoginForm } from '@/components/auth/LoginForm';
import { TestAccountsSection } from '@/components/auth/TestAccountsSection';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-vmSystem-blue dark:text-vmSystem-blue-light">
            Sign in to VM Guardian
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Enter your credentials to access your account
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8">
          <TestAccountsSection />
        </div>
      </div>
    </div>
  );
};

export default Login;

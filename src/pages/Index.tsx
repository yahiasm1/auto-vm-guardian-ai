
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Server, Brain, Shield, ChevronRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Server className="h-8 w-8 text-vmSystem-blue" />
            <span className="ml-2 text-2xl font-bold text-slate-900 dark:text-white">VM Guardian</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-vmSystem-blue dark:text-slate-300">Features</a>
            <a href="#about" className="text-slate-600 hover:text-vmSystem-blue dark:text-slate-300">About</a>
            <Button asChild>
              <Link to="/admin">Admin Dashboard</Link>
            </Button>
          </nav>
          <Button className="md:hidden" variant="outline" size="icon">
            <Server className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
              Automated Virtual Machine Guardian
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10">
              AI-driven resource optimization for academic VM environments
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link to="/student">Student Portal</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4 p-3 bg-vmSystem-blue/10 rounded-md w-fit">
                    <Server className="h-8 w-8 text-vmSystem-blue" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Automated VM Management</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Easily create, deploy, and manage virtual machines with automated resource allocation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4 p-3 bg-vmSystem-teal/10 rounded-md w-fit">
                    <Brain className="h-8 w-8 text-vmSystem-teal" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI-Driven Optimization</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Intelligent resource prediction and allocation using advanced AI algorithms.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4 p-3 bg-purple-500/10 rounded-md w-fit">
                    <Shield className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Secure Environment</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Isolated and secure virtual machines with built-in protection mechanisms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">About the Project</h2>
            <div className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300">
              <p className="mb-6">
                The Automated VM Guardian project focuses on creating an efficient Virtual Machine Management System 
                with AI-driven resource optimization, designed specifically for academic environments.
              </p>
              <p className="mb-6">
                By integrating Linux KVM for virtualization with an intuitive Admin Dashboard and Student Portal,
                the system minimizes manual interventions, improves scalability, and enhances the user experience.
              </p>
              <p>
                Our AI module predicts future resource demands, helping to prevent over-allocation and 
                maintain system stability, especially during peak usage periods.
              </p>
              
              <div className="mt-12 flex justify-center">
                <Button asChild>
                  <Link to="/admin" className="flex items-center">
                    Explore the Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 VM Guardian | Academic VM Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

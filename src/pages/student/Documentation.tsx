
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  FileText, 
  Terminal, 
  Database, 
  Search, 
  Monitor, 
  HardDrive, 
  Network 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Documentation data structure
interface DocItem {
  id: string;
  title: string;
  description: string;
  category: 'linux' | 'database' | 'web' | 'networking' | 'vms';
  content: string;
  lastUpdated: string;
}

// Sample documentation data
const documentationItems: DocItem[] = [
  {
    id: 'doc1',
    title: 'Linux Command Basics',
    description: 'Essential Linux commands for beginners.',
    category: 'linux',
    content: `
      # Linux Command Basics
      
      ## Navigation Commands
      - \`cd\` - Change directory
      - \`ls\` - List files
      - \`pwd\` - Print working directory
      
      ## File Operations
      - \`cp\` - Copy files
      - \`mv\` - Move files
      - \`rm\` - Remove files
      - \`touch\` - Create empty file
      
      ## System Information
      - \`top\` - View running processes
      - \`df -h\` - Disk usage
      - \`free -m\` - Memory usage
    `,
    lastUpdated: '2025-03-15'
  },
  {
    id: 'doc2',
    title: 'MySQL Database Setup',
    description: 'How to install and configure MySQL.',
    category: 'database',
    content: `
      # MySQL Database Setup
      
      ## Installation
      \`\`\`bash
      sudo apt update
      sudo apt install mysql-server
      \`\`\`
      
      ## Secure Installation
      \`\`\`bash
      sudo mysql_secure_installation
      \`\`\`
      
      ## Basic Commands
      - CREATE DATABASE dbname;
      - USE dbname;
      - CREATE TABLE tablename (...);
      - INSERT INTO tablename VALUES (...);
      - SELECT * FROM tablename;
    `,
    lastUpdated: '2025-03-20'
  },
  {
    id: 'doc3',
    title: 'Web Server Configuration',
    description: 'Setting up Apache and serving websites.',
    category: 'web',
    content: `
      # Web Server Configuration
      
      ## Apache Installation
      \`\`\`bash
      sudo apt update
      sudo apt install apache2
      \`\`\`
      
      ## Virtual Host Setup
      1. Create a configuration file in /etc/apache2/sites-available/
      2. Enable the site with a2ensite
      3. Reload Apache: sudo systemctl reload apache2
      
      ## Common Issues
      - 403 Forbidden: Check file permissions
      - 500 Server Error: Check error logs at /var/log/apache2/error.log
    `,
    lastUpdated: '2025-03-25'
  },
  {
    id: 'doc4',
    title: 'Network Configuration',
    description: 'Understanding and configuring network settings.',
    category: 'networking',
    content: `
      # Network Configuration
      
      ## View Network Interfaces
      \`\`\`bash
      ip addr show
      ifconfig
      \`\`\`
      
      ## Configure Static IP
      Edit /etc/netplan/01-netcfg.yaml:
      \`\`\`yaml
      network:
        version: 2
        ethernets:
          ens3:
            addresses: [192.168.1.100/24]
            gateway4: 192.168.1.1
            nameservers:
              addresses: [8.8.8.8, 8.8.4.4]
      \`\`\`
      
      Apply with: \`sudo netplan apply\`
    `,
    lastUpdated: '2025-04-01'
  },
  {
    id: 'doc5',
    title: 'VM Management Best Practices',
    description: 'Tips for managing your virtual machines effectively.',
    category: 'vms',
    content: `
      # VM Management Best Practices
      
      ## Performance Optimization
      - Keep VM snapshots to a minimum
      - Allocate appropriate resources
      - Use paravirtualized drivers when possible
      
      ## Backup Strategies
      - Regular snapshots for short-term recovery
      - Scheduled backups for long-term storage
      - Test your backups regularly
      
      ## Security Guidelines
      - Keep guest OS updated
      - Use strong passwords
      - Limit network exposure
      - Enable host firewall rules
    `,
    lastUpdated: '2025-04-05'
  }
];

const Documentation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Filter docs based on search and category
  const filteredDocs = documentationItems.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Category icons mapping
  const categoryIcons = {
    linux: <Terminal className="h-5 w-5" />,
    database: <Database className="h-5 w-5" />,
    web: <Monitor className="h-5 w-5" />,
    networking: <Network className="h-5 w-5" />,
    vms: <HardDrive className="h-5 w-5" />
  };

  return (
    <DashboardLayout title="Documentation" userType="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Course Documentation</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Access guides, tutorials and reference materials for your courses.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with search and categories */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="search"
                    placeholder="Search documentation..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Categories */}
                <div className="mb-4">
                  <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
                    <TabsList className="grid grid-cols-3 mb-2">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="linux">Linux</TabsTrigger>
                      <TabsTrigger value="database">DB</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="web">Web</TabsTrigger>
                      <TabsTrigger value="networking">Network</TabsTrigger>
                      <TabsTrigger value="vms">VMs</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* Document List */}
                <div className="space-y-2 mt-4">
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`
                          p-3 border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800
                          ${selectedDoc?.id === doc.id ? 'border-vmSystem-blue bg-blue-50 dark:bg-slate-700' : ''}
                        `}
                        onClick={() => setSelectedDoc(doc)}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">
                            {doc.category in categoryIcons && categoryIcons[doc.category as keyof typeof categoryIcons]}
                          </div>
                          <div>
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {doc.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 py-4 text-center">
                      No documents found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Document content area */}
          <div className="w-full md:w-2/3">
            <Card className="h-full">
              {selectedDoc ? (
                <>
                  <CardHeader>
                    <CardTitle>{selectedDoc.title}</CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Last updated: {selectedDoc.lastUpdated}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      {selectedDoc.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line.startsWith('# ') ? (
                            <h1 className="text-2xl font-bold mt-0">{line.substring(2)}</h1>
                          ) : line.startsWith('## ') ? (
                            <h2 className="text-xl font-bold">{line.substring(3)}</h2>
                          ) : line.startsWith('- ') ? (
                            <div className="flex">
                              <span className="mr-2">•</span>
                              <span>{line.substring(2)}</span>
                            </div>
                          ) : line.startsWith('```') ? (
                            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-x-auto">
                              <code>{line.substring(3)}</code>
                            </pre>
                          ) : (
                            <p>{line}</p>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-xl font-medium text-slate-600 dark:text-slate-300">
                    Select a document to view
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Choose from the list on the left
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;

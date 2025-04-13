
// Mock data for frontend-only application

// Virtual Machine Types
export interface VirtualMachine {
  id: string;
  name: string;
  os: string;
  status: 'running' | 'stopped' | 'suspended' | 'creating' | 'error';
  cpu: number;
  ram: number;
  storage: number;
  ip?: string;
  course?: string;
  user_id: string;
  created_at: string;
  last_updated: string;
}

// Assignment Types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  course: string;
  due_date: string;
  created_at: string;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// Resource Types
export interface Resource {
  id: string;
  user_id: string;
  cpu_usage: number;
  ram_usage: number;
  storage_usage: number;
  timestamp: string;
}

// Mock Virtual Machines
const mockVMs: VirtualMachine[] = [
  {
    id: 'vm-1',
    name: 'Web Development Environment',
    os: 'Ubuntu 22.04 LTS',
    status: 'running',
    cpu: 2,
    ram: 4,
    storage: 50,
    ip: '192.168.1.100',
    course: 'Web Development',
    user_id: 'student-id-456',
    created_at: '2025-03-01T10:00:00Z',
    last_updated: '2025-04-10T15:30:00Z'
  },
  {
    id: 'vm-2',
    name: 'Database Server',
    os: 'CentOS 8',
    status: 'stopped',
    cpu: 4,
    ram: 8,
    storage: 100,
    ip: '192.168.1.101',
    course: 'Database Design',
    user_id: 'student-id-456',
    created_at: '2025-03-05T14:00:00Z',
    last_updated: '2025-04-09T12:15:00Z'
  },
  {
    id: 'vm-3',
    name: 'Data Science Workstation',
    os: 'Fedora 36',
    status: 'suspended',
    cpu: 8,
    ram: 16,
    storage: 200,
    ip: '192.168.1.102',
    course: 'Data Science',
    user_id: 'admin-id-123',
    created_at: '2025-02-20T09:00:00Z',
    last_updated: '2025-04-11T16:45:00Z'
  },
  {
    id: 'vm-4',
    name: 'Network Security Lab',
    os: 'Kali Linux',
    status: 'running',
    cpu: 4,
    ram: 8,
    storage: 80,
    ip: '192.168.1.103',
    course: 'Network Security',
    user_id: 'instructor-id-789',
    created_at: '2025-03-15T11:30:00Z',
    last_updated: '2025-04-12T08:20:00Z'
  }
];

// Mock Assignments
const mockAssignments: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Create a Basic Web Application',
    description: 'Develop a simple web application using HTML, CSS, and JavaScript that implements a to-do list.',
    course: 'Web Development',
    due_date: '2025-04-20T23:59:59Z',
    created_at: '2025-04-01T10:00:00Z'
  },
  {
    id: 'assign-2',
    title: 'Database Schema Design',
    description: 'Design a normalized database schema for an e-commerce application with at least 5 tables.',
    course: 'Database Design',
    due_date: '2025-04-25T23:59:59Z',
    created_at: '2025-04-05T14:30:00Z'
  },
  {
    id: 'assign-3',
    title: 'Network Security Audit',
    description: 'Perform a security audit on the provided virtual network and document findings and remediation steps.',
    course: 'Network Security',
    due_date: '2025-04-30T23:59:59Z',
    created_at: '2025-04-10T09:15:00Z'
  }
];

// Mock Documents
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Introduction to HTML and CSS',
    content: 'This document provides an introduction to HTML and CSS, covering basic syntax, elements, and styling.',
    category: 'Web Development',
    created_at: '2025-03-01T10:00:00Z',
    updated_at: '2025-03-01T10:00:00Z'
  },
  {
    id: 'doc-2',
    title: 'SQL Fundamentals',
    content: 'Learn about SQL basics including SELECT, INSERT, UPDATE, and DELETE statements as well as JOINs and indexes.',
    category: 'Database Design',
    created_at: '2025-03-05T14:00:00Z',
    updated_at: '2025-03-10T11:30:00Z'
  },
  {
    id: 'doc-3',
    title: 'Network Security Best Practices',
    content: 'A comprehensive guide to network security best practices, including firewalls, encryption, and intrusion detection.',
    category: 'Network Security',
    created_at: '2025-03-15T09:00:00Z',
    updated_at: '2025-03-20T13:45:00Z'
  }
];

// Mock Resources (CPU, RAM, Storage usage)
const mockResources: Resource[] = [
  // Generate some mock data points for resources
  ...Array.from({ length: 24 }).map((_, i) => ({
    id: `resource-${i}`,
    user_id: 'student-id-456',
    cpu_usage: Math.floor(Math.random() * 60) + 20, // Random between 20-80%
    ram_usage: Math.floor(Math.random() * 50) + 30, // Random between 30-80%
    storage_usage: Math.floor(Math.random() * 30) + 40, // Random between 40-70%
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString() // Last 24 hours
  }))
];

// Resource usage for charts
export const resourceChartData = [
  { name: '00:00', cpu: 10, ram: 25, storage: 40 },
  { name: '03:00', cpu: 15, ram: 25, storage: 40 },
  { name: '06:00', cpu: 18, ram: 28, storage: 40 },
  { name: '09:00', cpu: 35, ram: 35, storage: 40 },
  { name: '12:00', cpu: 45, ram: 45, storage: 41 },
  { name: '15:00', cpu: 55, ram: 48, storage: 41 },
  { name: '18:00', cpu: 65, ram: 50, storage: 41 },
  { name: '21:00', cpu: 45, ram: 40, storage: 42 },
  { name: 'Now', cpu: 30, ram: 35, storage: 42 },
];

// Mock Service Functions

// VM Service
export const vmService = {
  getAllVMs: async () => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    return [...mockVMs];
  },
  
  getVMById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const vm = mockVMs.find(vm => vm.id === id);
    if (!vm) throw new Error('VM not found');
    return vm;
  },
  
  getVMsByUserId: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockVMs.filter(vm => vm.user_id === userId);
  },
  
  createVM: async (vm: Partial<VirtualMachine>) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const newVM: VirtualMachine = {
      id: `vm-${Date.now()}`,
      name: vm.name || 'New VM',
      os: vm.os || 'Ubuntu 22.04 LTS',
      status: 'creating',
      cpu: vm.cpu || 2,
      ram: vm.ram || 4,
      storage: vm.storage || 50,
      ip: undefined, // Will be assigned later
      course: vm.course,
      user_id: vm.user_id || 'admin-id-123',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    
    mockVMs.push(newVM);
    
    // Simulate VM creation process
    setTimeout(() => {
      const index = mockVMs.findIndex(v => v.id === newVM.id);
      if (index !== -1) {
        mockVMs[index] = {
          ...mockVMs[index],
          status: 'stopped',
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          last_updated: new Date().toISOString()
        };
      }
    }, 5000);
    
    return newVM;
  },
  
  updateVM: async (id: string, updates: Partial<VirtualMachine>) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockVMs.findIndex(vm => vm.id === id);
    if (index === -1) throw new Error('VM not found');
    
    mockVMs[index] = {
      ...mockVMs[index],
      ...updates,
      last_updated: new Date().toISOString()
    };
    
    return mockVMs[index];
  },
  
  deleteVM: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockVMs.findIndex(vm => vm.id === id);
    if (index === -1) throw new Error('VM not found');
    
    mockVMs.splice(index, 1);
    return true;
  },
  
  startVM: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const index = mockVMs.findIndex(vm => vm.id === id);
    if (index === -1) throw new Error('VM not found');
    
    mockVMs[index] = {
      ...mockVMs[index],
      status: 'running',
      last_updated: new Date().toISOString()
    };
    
    return mockVMs[index];
  },
  
  stopVM: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const index = mockVMs.findIndex(vm => vm.id === id);
    if (index === -1) throw new Error('VM not found');
    
    mockVMs[index] = {
      ...mockVMs[index],
      status: 'stopped',
      last_updated: new Date().toISOString()
    };
    
    return mockVMs[index];
  },
  
  suspendVM: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = mockVMs.findIndex(vm => vm.id === id);
    if (index === -1) throw new Error('VM not found');
    
    mockVMs[index] = {
      ...mockVMs[index],
      status: 'suspended',
      last_updated: new Date().toISOString()
    };
    
    return mockVMs[index];
  },
  
  getVMsByCourse: async (course: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockVMs.filter(vm => vm.course === course);
  }
};

// Assignment Service
export const assignmentService = {
  getAllAssignments: async () => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [...mockAssignments];
  },
  
  getAssignmentById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const assignment = mockAssignments.find(a => a.id === id);
    if (!assignment) throw new Error('Assignment not found');
    return assignment;
  },
  
  getAssignmentsByCourse: async (course: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockAssignments.filter(a => a.course === course);
  },
  
  createAssignment: async (assignment: Partial<Assignment>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      title: assignment.title || 'New Assignment',
      description: assignment.description || 'Assignment description',
      course: assignment.course || 'General',
      due_date: assignment.due_date || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    
    mockAssignments.push(newAssignment);
    return newAssignment;
  },
  
  updateAssignment: async (id: string, updates: Partial<Assignment>) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Assignment not found');
    
    mockAssignments[index] = {
      ...mockAssignments[index],
      ...updates
    };
    
    return mockAssignments[index];
  },
  
  deleteAssignment: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Assignment not found');
    
    mockAssignments.splice(index, 1);
    return true;
  },
  
  getUpcomingAssignments: async (limit: number = 5) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const sorted = [...mockAssignments]
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .filter(a => new Date(a.due_date) > new Date());
      
    return sorted.slice(0, limit);
  }
};

// Document Service
export const documentService = {
  getAllDocuments: async () => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [...mockDocuments];
  },
  
  getDocumentById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const document = mockDocuments.find(d => d.id === id);
    if (!document) throw new Error('Document not found');
    return document;
  },
  
  getDocumentsByCategory: async (category: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockDocuments.filter(d => d.category === category);
  },
  
  createDocument: async (document: Partial<Document>) => {
    await new Promise(resolve => setTimeout(resolve, 900));
    const now = new Date().toISOString();
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      title: document.title || 'New Document',
      content: document.content || 'Document content',
      category: document.category || 'General',
      created_at: now,
      updated_at: now
    };
    
    mockDocuments.push(newDocument);
    return newDocument;
  },
  
  updateDocument: async (id: string, updates: Partial<Document>) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockDocuments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');
    
    mockDocuments[index] = {
      ...mockDocuments[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return mockDocuments[index];
  },
  
  deleteDocument: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    const index = mockDocuments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');
    
    mockDocuments.splice(index, 1);
    return true;
  },
  
  searchDocuments: async (query: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const lowerQuery = query.toLowerCase();
    return mockDocuments.filter(d => 
      d.title.toLowerCase().includes(lowerQuery) || 
      d.content.toLowerCase().includes(lowerQuery)
    );
  }
};

// Resource Service
export const resourceService = {
  getResourcesByUserId: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockResources.filter(r => r.user_id === userId);
  },
  
  getResourceTimeline: async (userId: string, hours: number = 24) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);
    
    return mockResources
      .filter(r => r.user_id === userId && new Date(r.timestamp) >= startDate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  
  recordResourceUsage: async (resource: Partial<Resource>) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newResource: Resource = {
      id: `resource-${Date.now()}`,
      user_id: resource.user_id || 'unknown',
      cpu_usage: resource.cpu_usage || 0,
      ram_usage: resource.ram_usage || 0,
      storage_usage: resource.storage_usage || 0,
      timestamp: resource.timestamp || new Date().toISOString()
    };
    
    mockResources.push(newResource);
    return newResource;
  },
  
  getAggregatedResources: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get user resources
    const userResources = mockResources.filter(r => r.user_id === userId);
    
    if (userResources.length === 0) {
      return {
        current: {
          cpu_usage: 0,
          ram_usage: 0,
          storage_usage: 0
        },
        max: {
          max_cpu: 0,
          max_ram: 0,
          max_storage: 0
        },
        average: {
          avg_cpu: 0,
          avg_ram: 0,
          avg_storage: 0
        }
      };
    }
    
    // Sort by timestamp, most recent first
    const sortedResources = [...userResources].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Get the most recent resource usage
    const current = sortedResources[0];
    
    // Calculate max values
    const max_cpu = Math.max(...userResources.map(r => r.cpu_usage));
    const max_ram = Math.max(...userResources.map(r => r.ram_usage));
    const max_storage = Math.max(...userResources.map(r => r.storage_usage));
    
    // Calculate average values
    const avg_cpu = userResources.reduce((sum, r) => sum + r.cpu_usage, 0) / userResources.length;
    const avg_ram = userResources.reduce((sum, r) => sum + r.ram_usage, 0) / userResources.length;
    const avg_storage = userResources.reduce((sum, r) => sum + r.storage_usage, 0) / userResources.length;
    
    return {
      current,
      max: {
        max_cpu,
        max_ram,
        max_storage
      },
      average: {
        avg_cpu,
        avg_ram,
        avg_storage
      }
    };
  }
};

// User Service
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student' | 'guest';
  department: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  last_active: string;
  created_at: string;
}

const mockUsers: User[] = [
  {
    id: 'admin-id-123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'student-id-456',
    email: 'student@example.com',
    name: 'Student User',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2025-01-15T00:00:00Z'
  },
  {
    id: 'instructor-id-789',
    email: 'instructor@example.com',
    name: 'Instructor User',
    role: 'instructor',
    department: 'Electrical Engineering',
    status: 'active',
    last_active: new Date().toISOString(),
    created_at: '2025-01-10T00:00:00Z'
  }
];

export const userService = {
  getAllUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...mockUsers];
  },
  
  getUserById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },
  
  createUser: async (user: Partial<User>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: user.email || 'user@example.com',
      name: user.name || 'New User',
      role: user.role || 'student',
      department: user.department || 'General',
      status: user.status || 'pending',
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    return newUser;
  },
  
  updateUser: async (id: string, updates: Partial<User>) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...updates,
      last_active: new Date().toISOString()
    };
    
    return mockUsers[index];
  },
  
  deleteUser: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    mockUsers.splice(index, 1);
    return true;
  },
  
  getUsersByDepartment: async (department: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockUsers.filter(u => u.department === department);
  },
  
  getUsersByRole: async (role: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockUsers.filter(u => u.role === role);
  },
  
  updateUserStatus: async (id: string, status: 'active' | 'inactive' | 'suspended' | 'pending') => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    mockUsers[index] = {
      ...mockUsers[index],
      status,
      last_active: new Date().toISOString()
    };
    
    return mockUsers[index];
  }
};

// Database Verification
export const verifyDatabaseTables = async () => {
  // Mock version that always returns success since we're frontend only
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: 'All required tables exist',
    existingTables: ['users', 'virtual_machines', 'resources', 'documents', 'assignments'],
    missingTables: []
  };
};

export const checkUserExists = async (email: string) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockUsers.some(u => u.email === email);
};

export const initializeAdminUser = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // In our mock implementation, admin user is already initialized
  return false;
};

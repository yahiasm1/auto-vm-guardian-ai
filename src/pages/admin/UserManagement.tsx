
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Lock,
  Eye,
  UserX,
  CheckCircle,
  UserCog
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UserRole = 'admin' | 'instructor' | 'student' | 'guest';
type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastActive: string;
  createdAt: string;
}

interface DepartmentStats {
  name: string;
  count: number;
  color: string;
}

interface RoleStats {
  role: UserRole;
  count: number;
}

const initialUsers: User[] = [
  {
    id: 'u1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.edu',
    role: 'admin',
    department: 'IT',
    status: 'active',
    lastActive: '2023-04-11 09:45:22',
    createdAt: '2021-03-15',
  },
  {
    id: 'u2',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.edu',
    role: 'instructor',
    department: 'Computer Science',
    status: 'active',
    lastActive: '2023-04-11 08:30:15',
    createdAt: '2021-05-20',
  },
  {
    id: 'u3',
    name: 'Michael Brown',
    email: 'michael.brown@example.edu',
    role: 'instructor',
    department: 'Electrical Engineering',
    status: 'active',
    lastActive: '2023-04-10 14:22:45',
    createdAt: '2021-04-10',
  },
  {
    id: 'u4',
    name: 'Emily Davis',
    email: 'emily.davis@example.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    lastActive: '2023-04-11 10:15:33',
    createdAt: '2022-09-05',
  },
  {
    id: 'u5',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'inactive',
    lastActive: '2023-03-25 11:30:12',
    createdAt: '2022-09-05',
  },
  {
    id: 'u6',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@example.edu',
    role: 'student',
    department: 'Electrical Engineering',
    status: 'active',
    lastActive: '2023-04-10 15:45:22',
    createdAt: '2022-09-05',
  },
  {
    id: 'u7',
    name: 'David Miller',
    email: 'david.miller@example.edu',
    role: 'guest',
    department: 'External',
    status: 'pending',
    lastActive: 'Never',
    createdAt: '2023-04-09',
  },
  {
    id: 'u8',
    name: 'Patricia Moore',
    email: 'patricia.moore@example.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'suspended',
    lastActive: '2023-02-15 09:20:11',
    createdAt: '2022-09-05',
  },
];

const departmentStats: DepartmentStats[] = [
  { name: 'Computer Science', count: 35, color: 'bg-blue-500' },
  { name: 'Electrical Engineering', count: 23, color: 'bg-green-500' },
  { name: 'Mechanical Engineering', count: 18, color: 'bg-orange-500' },
  { name: 'IT', count: 12, color: 'bg-purple-500' },
  { name: 'External', count: 7, color: 'bg-gray-500' },
];

const roleStats: RoleStats[] = [
  { role: 'admin', count: 5 },
  { role: 'instructor', count: 15 },
  { role: 'student', count: 70 },
  { role: 'guest', count: 5 },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    department: 'Computer Science',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast('Validation Error', {
        description: 'Name and email are required.',
        style: { backgroundColor: 'rgb(239 68 68)' },
      });
      return;
    }

    const id = `u${users.length + 1}`;
    const now = new Date();
    
    const user: User = {
      id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: 'pending',
      lastActive: 'Never',
      createdAt: now.toISOString().split('T')[0],
    };

    setUsers([...users, user]);
    setIsAddUserDialogOpen(false);
    setNewUser({
      name: '',
      email: '',
      role: 'student',
      department: 'Computer Science',
    });

    toast('User Added', {
      description: `${user.name} has been added successfully.`
    });
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);
    
    setUsers(users.filter(user => user.id !== userId));
    
    if (userToDelete) {
      toast('User Deleted', {
        description: `${userToDelete.name} has been deleted from the system.`
      });
    }
  };

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: newStatus }
          : user
      )
    );

    const user = users.find(u => u.id === userId);
    if (user) {
      toast('User Status Updated', {
        description: `${user.name}'s status has been set to ${newStatus}.`
      });
    }
  };

  return (
    <DashboardLayout title="User Management" userType="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus size={16} className="mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                  <Input 
                    id="name" 
                    value={newUser.name} 
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="e.g., john.doe@example.edu"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">Role</label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value as UserRole})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">Department</label>
                  <Select 
                    value={newUser.department} 
                    onValueChange={(value) => setNewUser({...newUser, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="External">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddUser}>Add User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Users by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${dept.color} mr-2`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span>{dept.name}</span>
                        <span className="font-medium">{dept.count}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div 
                          className={`h-2 rounded-full ${dept.color}`} 
                          style={{ width: `${(dept.count / 95) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleStats.map((roleStat) => {
                  const roleColor = 
                    roleStat.role === 'admin' ? 'bg-purple-500' :
                    roleStat.role === 'instructor' ? 'bg-blue-500' :
                    roleStat.role === 'student' ? 'bg-green-500' :
                    'bg-gray-500';
                  
                  return (
                    <div key={roleStat.role} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${roleColor} mr-2`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="capitalize">{roleStat.role}</span>
                          <span className="font-medium">{roleStat.count}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div 
                            className={`h-2 rounded-full ${roleColor}`} 
                            style={{ width: `${(roleStat.count / 95) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.id}.png`} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                            user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit size={14} className="mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye size={14} className="mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Lock size={14} className="mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                              <CheckCircle size={14} className="mr-2" />
                              Set Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')}>
                              <UserX size={14} className="mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                              <Trash2 size={14} className="mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users size={64} className="mb-2 opacity-40" />
                        <h3 className="text-lg font-medium">No users found</h3>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;

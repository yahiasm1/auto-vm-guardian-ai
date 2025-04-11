
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Calendar, CheckCircle, Clock, Upload, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

// Assignment data structure
interface Assignment {
  id: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: {
    score: number;
    maxScore: number;
    feedback?: string;
  };
  submissionUrl?: string;
  attachments?: string[];
}

// Sample assignments data
const assignmentsData: Assignment[] = [
  {
    id: 'asg1',
    title: 'Linux Server Configuration',
    course: 'CS301: Server Administration',
    description: 'Configure an Ubuntu server with Apache, MySQL, and PHP. Set up virtual hosts and implement basic security measures.',
    dueDate: '2025-04-20',
    status: 'pending',
  },
  {
    id: 'asg2',
    title: 'Database Design Project',
    course: 'CS305: Database Systems',
    description: 'Design a normalized database schema for a library management system with appropriate relationships and constraints.',
    dueDate: '2025-04-25',
    status: 'pending',
  },
  {
    id: 'asg3',
    title: 'Network Troubleshooting Lab',
    course: 'CS310: Networking',
    description: 'Diagnose and fix network connectivity issues in the provided virtual environment using appropriate tools and commands.',
    dueDate: '2025-04-15',
    status: 'submitted',
    submissionUrl: 'network-diagnostics-report.pdf',
  },
  {
    id: 'asg4',
    title: 'Web Application Development',
    course: 'CS401: Web Technologies',
    description: 'Build a responsive React application with a Node.js backend that implements CRUD operations.',
    dueDate: '2025-03-30',
    status: 'graded',
    grade: {
      score: 92,
      maxScore: 100,
      feedback: 'Excellent work on the frontend design. The backend API implementation is robust. Consider adding more input validation.'
    }
  },
  {
    id: 'asg5',
    title: 'Cloud Deployment Exercise',
    course: 'CS450: Cloud Computing',
    description: 'Deploy a containerized application to a cloud provider using infrastructure as code principles.',
    dueDate: '2025-03-25',
    status: 'overdue',
  }
];

const Assignments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  // Filter assignments based on search and tab
  const filteredAssignments = assignmentsData.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      currentTab === 'all' || 
      (currentTab === 'pending' && assignment.status === 'pending') ||
      (currentTab === 'submitted' && assignment.status === 'submitted') ||
      (currentTab === 'graded' && assignment.status === 'graded') ||
      (currentTab === 'overdue' && assignment.status === 'overdue');
    
    return matchesSearch && matchesTab;
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  // Handle submission
  const handleSubmit = () => {
    if (!selectedAssignment) return;
    
    if (fileToUpload) {
      toast.success(`Assignment "${selectedAssignment.title}" submitted successfully!`);
      setFileToUpload(null);
      
      // In a real app, we would update the assignment status in the database
      // For this demo, we'll just simulate that:
      setSelectedAssignment({
        ...selectedAssignment,
        status: 'submitted',
        submissionUrl: fileToUpload.name
      });
    } else {
      toast.error("Please select a file to upload");
    }
  };

  // Format due date and calculate status
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Get status icon
  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Get status text
  const getStatusText = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'submitted':
        return 'Submitted';
      case 'graded':
        return 'Graded';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout title="Assignments" userType="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Course Assignments</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Manage and submit your assignments for all courses.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Assignments list panel */}
          <div className="w-full md:w-2/5">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    <span>Assignments</span>
                  </div>
                </CardTitle>
                
                {/* Search and filter */}
                <div className="mt-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      type="search"
                      placeholder="Search assignments..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Tabs defaultValue="all" onValueChange={setCurrentTab}>
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="submitted">Submitted</TabsTrigger>
                      <TabsTrigger value="graded">Graded</TabsTrigger>
                      <TabsTrigger value="overdue">Overdue</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mt-2">
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className={`
                          p-3 border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800
                          ${selectedAssignment?.id === assignment.id ? 'border-vmSystem-blue bg-blue-50 dark:bg-slate-700' : ''}
                        `}
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <div className="flex items-center">
                            {getStatusIcon(assignment.status)}
                            <span className={`text-xs ml-1
                              ${assignment.status === 'pending' ? 'text-yellow-600' : ''}
                              ${assignment.status === 'submitted' ? 'text-blue-600' : ''}
                              ${assignment.status === 'graded' ? 'text-green-600' : ''}
                              ${assignment.status === 'overdue' ? 'text-red-600' : ''}
                            `}>
                              {getStatusText(assignment.status)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {assignment.course}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Due: {formatDueDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
                      No assignments found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Assignment details panel */}
          <div className="w-full md:w-3/5">
            <Card className="h-full">
              {selectedAssignment ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedAssignment.title}</CardTitle>
                      <div className="flex items-center px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                        {getStatusIcon(selectedAssignment.status)}
                        <span className={`text-xs ml-1
                          ${selectedAssignment.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                          ${selectedAssignment.status === 'submitted' ? 'text-blue-600 dark:text-blue-400' : ''}
                          ${selectedAssignment.status === 'graded' ? 'text-green-600 dark:text-green-400' : ''}
                          ${selectedAssignment.status === 'overdue' ? 'text-red-600 dark:text-red-400' : ''}
                        `}>
                          {getStatusText(selectedAssignment.status)}
                        </span>
                      </div>
                    </div>
                    <CardDescription>
                      {selectedAssignment.course} • Due {formatDueDate(selectedAssignment.dueDate)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {selectedAssignment.description}
                        </p>
                      </div>
                      
                      {/* Grade if graded */}
                      {selectedAssignment.status === 'graded' && selectedAssignment.grade && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Feedback & Grade</h4>
                          
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Score</span>
                              <span className="font-medium">
                                {selectedAssignment.grade.score} / {selectedAssignment.grade.maxScore}
                              </span>
                            </div>
                            <Progress 
                              value={(selectedAssignment.grade.score / selectedAssignment.grade.maxScore) * 100} 
                              className="h-2" 
                            />
                          </div>
                          
                          {selectedAssignment.grade.feedback && (
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md mt-3 text-sm">
                              <p className="text-slate-600 dark:text-slate-300">
                                <span className="font-medium">Instructor feedback: </span>
                                {selectedAssignment.grade.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Submission section for pending, overdue, or submitted */}
                      {selectedAssignment.status !== 'graded' && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">
                            {selectedAssignment.status === 'submitted' ? 'Your Submission' : 'Submit Assignment'}
                          </h4>
                          
                          {/* If already submitted */}
                          {selectedAssignment.status === 'submitted' && selectedAssignment.submissionUrl && (
                            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded-md flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="text-sm">{selectedAssignment.submissionUrl}</span>
                              </div>
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </div>
                          )}
                          
                          {/* Submit form for pending or overdue */}
                          {(selectedAssignment.status === 'pending' || selectedAssignment.status === 'overdue') && (
                            <div className="space-y-4">
                              <div className="border-dashed border-2 rounded-md p-6">
                                <div className="flex flex-col items-center">
                                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                    Drop your file here, or <span className="text-blue-500">browse</span>
                                  </p>
                                  <Input 
                                    id="file" 
                                    type="file" 
                                    className="max-w-sm" 
                                    onChange={handleFileChange}
                                  />
                                  {fileToUpload && (
                                    <p className="mt-2 text-sm text-slate-500">
                                      Selected: {fileToUpload.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <Button onClick={handleSubmit}>
                                  Submit Assignment
                                </Button>
                              </div>
                              
                              {selectedAssignment.status === 'overdue' && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    This assignment is past due. Late penalties may apply.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-xl font-medium text-slate-600 dark:text-slate-300">
                    Select an assignment to view
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

export default Assignments;

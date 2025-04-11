
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Search, 
  FileQuestion, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// FAQ data
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'vm' | 'network' | 'account' | 'system';
}

const faqs: FAQ[] = [
  {
    id: 'faq1',
    question: 'How do I restart my virtual machine?',
    answer: 'To restart your VM, go to the "My VMs" page, find the VM you want to restart, click the three dots menu, and select "Restart". Wait a few moments for the VM to complete the restart process.',
    category: 'vm'
  },
  {
    id: 'faq2',
    question: 'What are the default login credentials for new VMs?',
    answer: 'For new VMs, the default username is "student" and the password is your student ID. You will be prompted to change this password on first login for security reasons.',
    category: 'vm'
  },
  {
    id: 'faq3',
    question: 'How do I connect to my VM via SSH?',
    answer: 'Use the SSH client of your choice and connect to the VM\'s IP address using your credentials. For Windows, you can use PuTTY or the built-in SSH client. For Mac/Linux, use the Terminal application with the command: ssh username@vm-ip-address',
    category: 'vm'
  },
  {
    id: 'faq4',
    question: 'My VM is running slowly. What can I do?',
    answer: 'First, check your resource usage on the "Resource Usage" page. If you\'re consistently near your limits, you may need to close unused applications, clear temporary files, or request additional resources from your instructor.',
    category: 'vm'
  },
  {
    id: 'faq5',
    question: 'How do I reset my account password?',
    answer: 'To reset your password, click on your profile icon in the top right, select "Account Settings", and then choose "Change Password". You\'ll need to verify your current password before setting a new one.',
    category: 'account'
  },
  {
    id: 'faq6',
    question: 'I can\'t connect to the internet from my VM. What should I check?',
    answer: 'First, check if your VM is in running status. Then verify network settings by checking the IP configuration using "ipconfig" (Windows) or "ifconfig" (Linux). If issues persist, your VM might be in a restricted network mode - contact support.',
    category: 'network'
  },
  {
    id: 'faq7',
    question: 'How long are my VMs available after the course ends?',
    answer: 'VMs are typically available for 30 days after course completion. We recommend backing up any important data before this period ends. You can request an extension if needed for ongoing projects.',
    category: 'system'
  },
  {
    id: 'faq8',
    question: 'Can I increase my storage quota?',
    answer: 'Yes, you can request additional storage by visiting the "Resource Usage" page and clicking "Request Storage" button. Your instructor will review and approve this request based on course requirements.',
    category: 'system'
  },
];

// Support ticket data
interface Ticket {
  id: string;
  subject: string;
  description: string;
  createdAt: string;
  status: 'open' | 'in-progress' | 'resolved';
  replies?: {
    message: string;
    from: 'student' | 'support';
    timestamp: string;
  }[];
}

const supportTickets: Ticket[] = [
  {
    id: 'ticket1',
    subject: 'Cannot access MySQL database',
    description: 'I\'m trying to connect to MySQL on my VM using the credentials provided, but it\'s giving me an "Access denied" error.',
    createdAt: '2025-04-08T14:30:00',
    status: 'resolved',
    replies: [
      {
        message: 'Hi there! Please check if the MySQL service is running with "systemctl status mysql". Also, verify your username and password are correct.',
        from: 'support',
        timestamp: '2025-04-08T15:45:00'
      },
      {
        message: 'I checked and the service wasn\'t running. After starting it with "systemctl start mysql", I can connect now. Thank you!',
        from: 'student',
        timestamp: '2025-04-08T16:20:00'
      },
      {
        message: 'Great! I\'ve added this to our common issues guide. Let us know if you encounter any other issues.',
        from: 'support',
        timestamp: '2025-04-08T16:45:00'
      }
    ]
  },
  {
    id: 'ticket2',
    subject: 'VM keeps freezing during compilation',
    description: 'When I try to compile a large project, my VM becomes unresponsive for several minutes.',
    createdAt: '2025-04-10T09:15:00',
    status: 'in-progress',
    replies: [
      {
        message: 'This could be related to resource limitations. Can you share your VM specs and what you\'re compiling?',
        from: 'support',
        timestamp: '2025-04-10T10:30:00'
      },
      {
        message: 'I have 2 vCPUs and 4GB RAM. I\'m compiling a C++ project with many dependencies using make -j4.',
        from: 'student',
        timestamp: '2025-04-10T11:05:00'
      },
      {
        message: 'The -j4 flag is telling make to run 4 parallel jobs, but you only have 2 vCPUs. Try using make -j2 instead. I\'ve also increased your RAM allocation to 6GB for this project.',
        from: 'support',
        timestamp: '2025-04-10T13:20:00'
      }
    ]
  }
];

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<string>('all');
  const [expandedFAQs, setExpandedFAQs] = useState<Record<string, boolean>>({});
  
  // New ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  
  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedFAQCategory === 'all' || faq.category === selectedFAQCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Toggle FAQ expanded state
  const toggleFAQ = (id: string) => {
    setExpandedFAQs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle submit ticket
  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Please fill in both subject and description");
      return;
    }
    
    toast.success("Support ticket submitted successfully!");
    setTicketSubject('');
    setTicketDescription('');
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  // Get status icon for tickets
  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Help & Support" userType="student">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Help & Support</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Find answers to common questions or contact our support team.
          </p>
        </div>

        <Tabs defaultValue="faq">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <MessageSquare className="h-4 w-4 mr-2" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
          </TabsList>
          
          {/* FAQs Tab */}
          <TabsContent value="faq" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about using our virtual machine platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and filters */}
                <div className="mb-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      type="search"
                      placeholder="Search FAQs..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Tabs defaultValue="all" onValueChange={setSelectedFAQCategory}>
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="vm">VMs</TabsTrigger>
                      <TabsTrigger value="network">Network</TabsTrigger>
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* FAQ list */}
                <div className="space-y-3">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq) => (
                      <div key={faq.id} className="border rounded-md">
                        <button
                          className="flex items-center justify-between w-full p-4 text-left"
                          onClick={() => toggleFAQ(faq.id)}
                        >
                          <div className="flex items-start">
                            <FileQuestion className="h-5 w-5 mr-3 text-vmSystem-blue flex-shrink-0 mt-0.5" />
                            <h3 className="font-medium">{faq.question}</h3>
                          </div>
                          {expandedFAQs[faq.id] ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                        
                        {expandedFAQs[faq.id] && (
                          <div className="p-4 pt-0 border-t">
                            <p className="text-slate-600 dark:text-slate-300 pl-8">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
                      No FAQs found matching your query.
                    </p>
                  )}
                </div>
                
                {/* Didn't find answer */}
                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
                  <h3 className="font-medium mb-2">Didn't find your answer?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Our support team is ready to help with any questions or issues.
                  </p>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Support Tickets</span>
                  <Button>Create New Ticket</Button>
                </CardTitle>
                <CardDescription>
                  Track and manage your support requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.length > 0 ? (
                    supportTickets.map((ticket) => (
                      <div key={ticket.id} className="border rounded-md overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <div className="flex items-center">
                              {getStatusIcon(ticket.status)}
                              <span className="text-xs ml-1 capitalize">
                                {ticket.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Opened: {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                        
                        <div className="p-4 border-t">
                          <div className="mb-4">
                            <div className="text-sm font-medium mb-1">Your request:</div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {ticket.description}
                            </p>
                          </div>
                          
                          {ticket.replies && ticket.replies.length > 0 && (
                            <div className="space-y-3 mt-4">
                              {ticket.replies.map((reply, index) => (
                                <div 
                                  key={index} 
                                  className={`p-3 rounded-md ${
                                    reply.from === 'support' 
                                      ? 'bg-blue-50 dark:bg-blue-900/20 ml-4' 
                                      : 'bg-slate-50 dark:bg-slate-800 mr-4'
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium">
                                      {reply.from === 'support' ? 'Support Team' : 'You'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {formatDate(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{reply.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {ticket.status !== 'resolved' && (
                            <div className="mt-4 pt-4 border-t">
                              <Textarea 
                                placeholder="Type your reply here..." 
                                className="mb-2" 
                              />
                              <div className="flex justify-end">
                                <Button>
                                  Reply
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
                      You don't have any support tickets yet.
                    </p>
                  )}
                </div>
                
                {/* New Ticket Form */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium mb-4">Create New Support Ticket</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="subject">
                        Subject
                      </label>
                      <Input 
                        id="subject" 
                        placeholder="Brief description of your issue" 
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="description">
                        Description
                      </label>
                      <Textarea 
                        id="description" 
                        placeholder="Please provide details about your issue..." 
                        className="min-h-[120px]"
                        value={ticketDescription}
                        onChange={(e) => setTicketDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSubmitTicket}>
                        Submit Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get in touch with our support team for assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Methods */}
                  <div>
                    <h3 className="font-medium mb-4">Support Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 mr-3 text-vmSystem-blue" />
                        <div>
                          <h4 className="font-medium">Email Support</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            <a href="mailto:support@vmguardian.edu" className="text-blue-600 dark:text-blue-400 hover:underline">
                              support@vmguardian.edu
                            </a>
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Response time: 24-48 hours
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-3 text-vmSystem-blue" />
                        <div>
                          <h4 className="font-medium">Phone Support</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            <a href="tel:+15551234567" className="text-blue-600 dark:text-blue-400 hover:underline">
                              +1 (555) 123-4567
                            </a>
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Monday-Friday, 9am-5pm EST
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 mr-3 text-vmSystem-blue" />
                        <div>
                          <h4 className="font-medium">Live Chat</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Available on weekdays during business hours
                          </p>
                          <Button className="mt-2" variant="outline" size="sm">
                            Start Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Contact Form */}
                  <div>
                    <h3 className="font-medium mb-4">Quick Message</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="name">
                          Name
                        </label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="email">
                          Email
                        </label>
                        <Input id="email" type="email" placeholder="Your email" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="message">
                          Message
                        </label>
                        <Textarea id="message" placeholder="How can we help?" />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button onClick={() => toast.success("Message sent successfully!")}>
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Support Hours */}
                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
                  <h3 className="font-medium mb-2">Support Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Technical Support</h4>
                      <p className="text-sm">Monday-Friday: 8am-8pm EST</p>
                      <p className="text-sm">Saturday: 10am-4pm EST</p>
                      <p className="text-sm">Sunday: Closed</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Emergency Support</h4>
                      <p className="text-sm">Available 24/7 for critical issues</p>
                      <p className="text-sm text-slate-500">
                        Use emergency contact only for system-down situations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;

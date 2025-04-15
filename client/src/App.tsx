
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import IndexPage from "@/pages/Index";

// Admin Pages
import AdminDashboard from "@/pages/AdminDashboard";
import AdminVMsPage from "@/pages/AdminVMs";
import AdminVMRequests from "@/pages/AdminVMRequests";
import AdminUsersPage from "@/pages/AdminUsers";

// Student Pages
import StudentDashboard from "@/pages/StudentDashboard";
import StudentVMsPage from "@/pages/StudentVMs";
import StudentVMRequests from "@/pages/StudentVMRequests";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={["admin"]} />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="vms" element={<AdminVMsPage />} />
            <Route path="vm-requests" element={<AdminVMRequests />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={<ProtectedRoute allowedRoles={["student"]} />}
          >
            <Route index element={<StudentDashboard />} />
            <Route path="vms" element={<StudentVMsPage />} />
            <Route path="vm-requests" element={<StudentVMRequests />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

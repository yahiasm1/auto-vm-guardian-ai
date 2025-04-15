
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vms"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminVMsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vm-requests"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminVMRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/vms"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentVMsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/vm-requests"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentVMRequests />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AuthProvider } from "./lib/auth";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminVMs from "./pages/AdminVMs";
import AdminVMTypes from "./pages/AdminVMTypes";
import AdminVMRequests from "./pages/AdminVMRequests";
import StudentDashboard from "./pages/StudentDashboard";
import StudentVMs from "./pages/StudentVMs";
import StudentVMRequests from "./pages/StudentVMRequests";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vms"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminVMs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vm-types"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminVMTypes />
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
            
            {/* Student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student", "instructor"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/vms"
              element={
                <ProtectedRoute allowedRoles={["student", "instructor"]}>
                  <StudentVMs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/vm-requests"
              element={
                <ProtectedRoute allowedRoles={["student", "instructor"]}>
                  <StudentVMRequests />
                </ProtectedRoute>
              }
            />
            
            {/* Common routes */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["admin", "student", "instructor"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FiPlus, FiRefreshCw, FiUser } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddUserModal } from "@/components/User/AddUserModal";
import userService from "@/services/userService";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const AdminUsersPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });

  const handleUserAdded = () => {
    refetch();
  };

  return (
    <DashboardLayout title="User Management" userType="admin">
      <div className="gap-y-6">
        <div className="flex justify-end items-center my-6">
          <div className="gap-x-2 flex">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <FiRefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <FiPlus size={16} /> Add User
            </Button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
            <h3 className="font-medium">Error loading users</h3>
            <p className="text-sm mt-1">{(error as Error).message}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Loading users...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : user.role === "instructor"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "success"
                              : user.status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {user.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_active
                          ? format(new Date(user.last_active), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <FiUser className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">
                        No users found
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </DashboardLayout>
  );
};

export default AdminUsersPage;

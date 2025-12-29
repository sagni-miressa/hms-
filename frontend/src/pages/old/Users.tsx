import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getUsers, updateUser, deleteUser } from "@/services/users.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/checkbox";
import { Role, ClearanceLevel } from "@/types";

export const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: () => getUsers({ search, limit: 50 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditModalOpen(false);
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to update user"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to delete user"
      );
    },
  });

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(userId);
    }
  };

  const roleOptions: { value: Role; label: string }[] = [
    { value: Role.APPLICANT, label: "Applicant" },
    { value: Role.RECRUITER, label: "Recruiter" },
    { value: Role.INTERVIEWER, label: "Interviewer" },
    { value: Role.HR_MANAGER, label: "HR Manager" },
    { value: Role.AUDITOR, label: "Auditor" },
    { value: Role.SYSTEM_ADMIN, label: "System Admin" },
  ];

  const clearanceOptions: { value: ClearanceLevel; label: string }[] = [
    { value: ClearanceLevel.PUBLIC, label: "Public" },
    { value: ClearanceLevel.INTERNAL, label: "Internal" },
    { value: ClearanceLevel.CONFIDENTIAL, label: "Confidential" },
    { value: ClearanceLevel.RESTRICTED, label: "Restricted" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="h-8 w-8" />
            <span>User Management</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Manage users, roles, and permissions
          </p>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search users by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Roles</TableHeaderCell>
              <TableHeaderCell>Clearance</TableHeaderCell>
              <TableHeaderCell>Department</TableHeaderCell>
              <TableHeaderCell>MFA</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {data?.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="info">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{user.clearanceLevel}</Badge>
                  </TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={user.mfaEnabled ? "success" : "warning"}>
                      {user.mfaEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle update
                const form = document.getElementById(
                  "edit-user-form"
                ) as HTMLFormElement;
                if (form) {
                  const formData = new FormData(form);
                  updateMutation.mutate({
                    userId: selectedUser.id,
                    data: {
                      roles: formData.getAll("roles") as Role[],
                      clearanceLevel: formData.get(
                        "clearanceLevel"
                      ) as ClearanceLevel,
                      department:
                        formData.get("department")?.toString() || null,
                    },
                  });
                }
              }}
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        {selectedUser && (
          <form id="edit-user-form" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <p className="text-gray-900">{selectedUser.email}</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Roles
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((role) => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.value}`}
                      name="roles"
                      value={role.value}
                      defaultChecked={selectedUser.roles.includes(role.value)}
                    />
                    <label
                      htmlFor={`role-${role.value}`}
                      className="text-sm font-normal text-gray-700 cursor-pointer"
                    >
                      {role.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Clearance Level
              </label>
              <Select
                name="clearanceLevel"
                defaultValue={selectedUser.clearanceLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent>
                  {clearanceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                name="department"
                label="Department"
                defaultValue={selectedUser.department || ""}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ClearanceBadge, ClearanceLevel } from "@/components/ui/ClearanceBadge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { SecureActionButton } from "@/components/ui/SecureActionButton";
import {
  Search,
  Filter,
  Plus,
  Shield,
  UserCog,
  Mail,
  MoreVertical,
  Edit,
  Key,
  Trash2,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  clearance: ClearanceLevel;
  status: "active" | "pending" | "inactive";
  lastActive: string;
  mfaEnabled: boolean;
}

const users: User[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@company.com",
    role: "HR Manager",
    department: "Human Resources",
    clearance: "confidential",
    status: "active",
    lastActive: "Just now",
    mfaEnabled: true,
  },
  {
    id: "2",
    name: "John Davis",
    email: "john.davis@company.com",
    role: "Recruiter",
    department: "Talent Acquisition",
    clearance: "internal",
    status: "active",
    lastActive: "5 min ago",
    mfaEnabled: true,
  },
  {
    id: "3",
    name: "Amanda Chen",
    email: "amanda.chen@company.com",
    role: "Hiring Manager",
    department: "Engineering",
    clearance: "secret",
    status: "active",
    lastActive: "1 hour ago",
    mfaEnabled: true,
  },
  {
    id: "4",
    name: "Robert Wilson",
    email: "robert.wilson@company.com",
    role: "System Admin",
    department: "IT",
    clearance: "top-secret",
    status: "active",
    lastActive: "2 hours ago",
    mfaEnabled: true,
  },
  {
    id: "5",
    name: "Jennifer Lee",
    email: "jennifer.lee@company.com",
    role: "Recruiter",
    department: "Talent Acquisition",
    clearance: "internal",
    status: "pending",
    lastActive: "Never",
    mfaEnabled: false,
  },
  {
    id: "6",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    role: "HR Coordinator",
    department: "Human Resources",
    clearance: "internal",
    status: "inactive",
    lastActive: "30 days ago",
    mfaEnabled: false,
  },
];

const roleColors: Record<string, string> = {
  "HR Manager": "bg-accent text-accent-foreground",
  Recruiter: "bg-info/10 text-info",
  "Hiring Manager": "bg-warning/10 text-warning",
  "System Admin": "bg-destructive/10 text-destructive",
  "HR Coordinator": "bg-success/10 text-success",
};

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResetPassword = (userName: string) => {
    toast({
      title: "Password reset initiated",
      description: `A password reset link has been sent to ${userName}.`,
    });
  };

  return (
    <AppLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and security permissions
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <UserCog className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.status === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Lock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.mfaEnabled).length}
                </p>
                <p className="text-sm text-muted-foreground">MFA Enabled</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <UserCog className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.status === "inactive").length}
                </p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Users Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Clearance</th>
                  <th>Status</th>
                  <th>MFA</th>
                  <th>Last Active</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge className={roleColors[user.role] || "bg-muted"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <ClearanceBadge level={user.clearance} />
                    </td>
                    <td>
                      <StatusIndicator status={user.status} />
                    </td>
                    <td>
                      {user.mfaEnabled ? (
                        <span className="inline-flex items-center gap-1 text-success text-sm">
                          <Shield className="h-4 w-4" />
                          Enabled
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground text-sm">
                      {user.lastActive}
                    </td>
                    <td className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetPassword(user.name)}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Security Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deactivate User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User, Lock, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { changePassword } from "@/services/auth.service";
import { getCurrentUser } from "@/services/auth.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "security"
  >("profile");

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully");
      reset();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to change password"
      );
    },
  });

  const onSubmit = (data: PasswordForm) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card title="Profile Information">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <p className="text-gray-900">{userData?.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username
                </label>
                <p className="text-gray-900">
                  {userData?.user.username || "Not set"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {userData?.user.roles.map((role) => (
                    <Badge key={role} variant="info">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Clearance Level
                </label>
                <Badge variant="default">{userData?.user.clearanceLevel}</Badge>
              </div>
            </div>
            {userData?.user.department && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Department
                </label>
                <p className="text-gray-900">{userData.user.department}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <Card title="Change Password">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              {...register("currentPassword")}
              error={errors.currentPassword?.message}
            />
            <Input
              label="New Password"
              type="password"
              {...register("newPassword")}
              error={errors.newPassword?.message}
              helperText="Must be at least 12 characters with uppercase, lowercase, number, and special character"
            />
            <Input
              label="Confirm New Password"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" isLoading={passwordMutation.isPending}>
              Change Password
            </Button>
          </form>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card title="Multi-Factor Authentication">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userData?.user.mfaEnabled
                      ? "MFA is enabled on your account"
                      : "Add an extra layer of security to your account"}
                  </p>
                </div>
                <Badge
                  variant={userData?.user.mfaEnabled ? "success" : "warning"}
                >
                  {userData?.user.mfaEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <Link to="/settings/mfa">
                <Button variant="outline" className="w-full">
                  {userData?.user.mfaEnabled ? "Manage MFA" : "Setup MFA"}
                </Button>
              </Link>
            </div>
          </Card>

          <Card title="Active Sessions">
            <p className="text-sm text-gray-500">
              View and manage your active sessions across different devices.
            </p>
            <Button variant="outline" className="mt-4">
              View Sessions
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

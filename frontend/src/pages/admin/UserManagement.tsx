import React from "react";
import { StatsCard } from "../../components/Admin/StatsCard";
import { UsersTable } from "../../components/Admin/UsersTable";

export const UserManagement: React.FC = () => {
  // Dummy data for stats
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "12.5%",
      changeType: "increase" as const,
      changeColor: "text-green-600",
      changeBg: "bg-green-100 dark:bg-green-900/30",
      icon: "group",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "Active Users",
      value: "1,890",
      change: "5.2%",
      changeType: "increase" as const,
      changeColor: "text-green-600",
      changeBg: "bg-green-100 dark:bg-green-900/30",
      icon: "person_check",
      iconColor: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "New Users",
      value: "145",
      change: "2.4%",
      changeType: "decrease" as const,
      changeColor: "text-red-600",
      changeBg: "bg-red-100 dark:bg-red-900/30",
      icon: "person_add",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Pending Approval",
      value: "28",
      change: "8.1%",
      changeType: "increase" as const,
      changeColor: "text-green-600",
      changeBg: "bg-green-100 dark:bg-green-900/30",
      icon: "pending",
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  // Dummy data for users
  const users = [
    {
      id: "1",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      avatar: "https://i.pravatar.cc/150?u=1",
      role: "Admin",
      roleColor: "text-purple-700 dark:text-purple-300",
      roleBg: "bg-purple-100 dark:bg-purple-900/30",
      department: "Engineering",
      status: "Active" as const,
      lastActive: "2 mins ago",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@example.com",
      avatar: "https://i.pravatar.cc/150?u=2",
      role: "Manager",
      roleColor: "text-blue-700 dark:text-blue-300",
      roleBg: "bg-blue-100 dark:bg-blue-900/30",
      department: "Product",
      status: "Active" as const,
      lastActive: "1 hour ago",
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma.davis@example.com",
      avatar: "https://i.pravatar.cc/150?u=3",
      role: "User",
      roleColor: "text-gray-700 dark:text-gray-300",
      roleBg: "bg-gray-100 dark:bg-gray-800",
      department: "Marketing",
      status: "Inactive" as const,
      lastActive: "2 days ago",
    },
    {
      id: "4",
      name: "James Rodriguez",
      email: "james.r@example.com",
      avatar: "https://i.pravatar.cc/150?u=4",
      role: "User",
      roleColor: "text-gray-700 dark:text-gray-300",
      roleBg: "bg-gray-100 dark:bg-gray-800",
      department: "Sales",
      status: "Suspended" as const,
      lastActive: "1 week ago",
    },
    {
      id: "5",
      name: "Lisa Thompson",
      email: "lisa.t@example.com",
      avatar: "https://i.pravatar.cc/150?u=5",
      role: "Manager",
      roleColor: "text-blue-700 dark:text-blue-300",
      roleBg: "bg-blue-100 dark:bg-blue-900/30",
      department: "HR",
      status: "Pending" as const,
      lastActive: "Never",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white">
            User Management
          </h1>
          <p className="text-text-muted dark:text-gray-400 mt-1">
            Manage user access, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
            Export
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add User
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Users Table */}
      <UsersTable users={users} />
    </div>
  );
};

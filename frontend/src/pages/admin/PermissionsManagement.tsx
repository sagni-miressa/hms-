import React, { useState } from "react";
import { RolesList } from "../../components/Admin/RolesList";
import { RoleEditor } from "../../components/Admin/RoleEditor";

export const PermissionsManagement: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState("1");

  // Dummy data for roles
  const roles = [
    { id: "1", name: "Recruiter", userCount: 12, isActive: true },
    { id: "2", name: "Super Admin", userCount: 2, isActive: false },
    { id: "3", name: "Hiring Manager", userCount: 45, isActive: false },
    { id: "4", name: "Interviewer", userCount: 8, isActive: false },
  ];

  // Dummy data for permissions (would typically be fetched based on selectedRoleId)
  const permissionGroups = [
    {
      id: "candidates",
      name: "Candidate Management",
      icon: "group",
      activeCount: 3,
      totalCount: 5,
      permissions: [
        {
          id: "p1",
          name: "View Candidate Profiles",
          description: "Allow access to view full details of candidates.",
          enabled: true,
        },
        {
          id: "p2",
          name: "Edit Candidates",
          description: "Modify candidate information and status.",
          enabled: true,
        },
        {
          id: "p3",
          name: "Delete Candidates",
          description: "Permanently remove candidates from the system.",
          enabled: false,
        },
      ],
    },
    {
      id: "jobs",
      name: "Job Management",
      icon: "work",
      activeCount: 2,
      totalCount: 4,
      permissions: [
        {
          id: "p4",
          name: "Create New Jobs",
          description: "Draft and save new job requisitions.",
          enabled: true,
        },
        {
          id: "p5",
          name: "Publish Jobs",
          description: "Make jobs visible on the careers page and job boards.",
          enabled: true,
        },
      ],
    },
    {
      id: "admin",
      name: "System Configuration",
      icon: "admin_panel_settings",
      activeCount: 0,
      totalCount: 3,
      permissions: [
        {
          id: "p6",
          name: "Manage Billing",
          description: "Access invoices and update payment methods.",
          enabled: false,
        },
      ],
    },
  ];

  const handleSave = () => {
    console.log("Saving permissions...");
  };

  const handleDiscard = () => {
    console.log("Discarding changes...");
  };

  const handleDelete = () => {
    console.log("Deleting role...");
  };

  const handleCreateRole = () => {
    console.log("Creating new role...");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.32))]">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-end gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 mb-6 shrink-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-text-main dark:text-white text-3xl font-black tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-text-muted dark:text-gray-400 max-w-2xl">
            Manage user access levels across the recruitment platform. Define
            what each role can see and do.
          </p>
        </div>
      </div>

      {/* Roles & Permissions Interface */}
      <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex flex-col md:flex-row flex-1">
        <RolesList
          roles={roles}
          selectedRoleId={selectedRoleId}
          onSelectRole={setSelectedRoleId}
          onCreateRole={handleCreateRole}
        />
        <RoleEditor
          roleName="Recruiter"
          roleDescription="Can manage job postings, view candidates, and schedule interviews. Restricted from system settings."
          permissionGroups={permissionGroups}
          onSave={handleSave}
          onDiscard={handleDiscard}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

import React from "react";

interface Role {
  id: string;
  name: string;
  userCount: number;
  isActive: boolean;
}

interface RolesListProps {
  roles: Role[];
  selectedRoleId: string;
  onSelectRole: (id: string) => void;
  onCreateRole: () => void;
}

export const RolesList: React.FC<RolesListProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
  onCreateRole,
}) => {
  return (
    <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-surface-dark">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Defined Roles
        </h3>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 material-symbols-outlined text-[18px]">
            search
          </span>
          <input
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-surface-dark dark:border-gray-700 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-gray-200"
            placeholder="Search roles..."
            type="text"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors group ${
              selectedRoleId === role.id
                ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-transparent shadow-sm ring-1 ring-primary/20 dark:ring-primary/40"
                : "hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="flex flex-col">
              <span
                className={`font-medium text-sm ${
                  selectedRoleId === role.id
                    ? "text-primary font-bold"
                    : "text-text-main dark:text-gray-200 group-hover:text-primary"
                }`}
              >
                {role.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {role.userCount} users assigned
              </span>
            </div>
            {selectedRoleId === role.id && (
              <span className="material-symbols-outlined text-primary text-sm">
                chevron_right
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto bg-white dark:bg-surface-dark">
        <button
          onClick={onCreateRole}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create New Role
        </button>
      </div>
    </div>
  );
};

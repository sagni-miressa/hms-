import React from "react";

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PermissionGroup {
  id: string;
  name: string;
  icon: string;
  activeCount: number;
  totalCount: number;
  permissions: Permission[];
}

interface RoleEditorProps {
  roleName: string;
  roleDescription: string;
  permissionGroups: PermissionGroup[];
  onSave: () => void;
  onDiscard: () => void;
  onDelete: () => void;
}

export const RoleEditor: React.FC<RoleEditorProps> = ({
  roleName,
  roleDescription,
  permissionGroups,
  onSave,
  onDiscard,
  onDelete,
}) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-surface-dark">
      {/* Role Header Form */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 max-w-lg space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Role Name
              </label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                  defaultValue={roleName}
                >
                  <option value="Recruiter">Recruiter</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="Interviewer">Interviewer</option>
                  <option value="User">User</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={2}
                defaultValue={roleDescription}
              ></textarea>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Delete Role
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Area */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Permissions Configuration
          </h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400">
              <input
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                type="checkbox"
              />
              Grant All Permissions
            </label>
          </div>
        </div>

        <div className="space-y-6">
          {permissionGroups.map((group) => (
            <div
              key={group.id}
              className={`border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden ${
                group.activeCount === 0 ? "opacity-75" : ""
              }`}
            >
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2 text-text-main dark:text-white font-bold">
                  <span className="material-symbols-outlined text-primary">
                    {group.icon}
                  </span>
                  {group.name}
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                  {group.activeCount}/{group.totalCount} Active
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-surface-dark">
                {group.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-main dark:text-gray-200">
                        {permission.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={permission.enabled}
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer for Main Content */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark flex justify-end gap-3 rounded-br-xl">
        <button
          onClick={onDiscard}
          className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Discard Changes
        </button>
        <button
          onClick={onSave}
          className="px-5 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

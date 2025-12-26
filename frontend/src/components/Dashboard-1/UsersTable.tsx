import React from "react";

interface User {
  name: string;
  email: string;
  role: string;
  roleIcon: string;
  status: string;
  lastLogin: string;
  avatar: string;
}

export const UsersTable: React.FC<{ users: User[] }> = ({ users }) => {
  return (
    <div className="rounded-xl bg-surface-light dark:bg-[#221a10] border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f9fafb] dark:bg-[#2d2418] text-[#637588] dark:text-[#b9ad9d] text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Last Login</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {users.map((user, idx) => (
              <tr key={idx} className="group hover:bg-[#f9fafb] dark:hover:bg-[#2d2418] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }}></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium dark:text-white">{user.name}</span>
                      <span className="text-xs text-[#637588] dark:text-[#9ca3af]">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${user.roleIcon}`}>{user.roleIcon}</span>
                    <span className="text-sm dark:text-gray-300">{user.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#637588] dark:text-[#9ca3af]">{user.lastLogin}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-[#637588] dark:text-[#b9ad9d] hover:text-primary">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-[#637588] dark:text-[#b9ad9d] hover:text-red-500">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

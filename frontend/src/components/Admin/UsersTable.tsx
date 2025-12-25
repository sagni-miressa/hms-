import React from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  roleColor: string;
  roleBg: string;
  department: string;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  lastActive: string;
}

interface UsersTableProps {
  users: User[];
}

export const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "Suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-600 dark:bg-green-400";
      case "Inactive":
        return "bg-gray-500";
      case "Suspended":
        return "bg-red-600 dark:bg-red-400";
      case "Pending":
        return "bg-yellow-600 dark:bg-yellow-400";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row p-4 gap-4 justify-between items-center border-b border-gray-100 dark:border-gray-700">
        {/* Search */}
        <div className="relative w-full lg:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">
              search
            </span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-text-main dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search users by name, email or ID..."
            type="text"
          />
        </div>
        {/* Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
              Role: All
            </button>
          </div>
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px]">
                toggle_on
              </span>
              Status: Active
            </button>
          </div>
          <button className="text-sm text-primary font-medium hover:text-primary-hover whitespace-nowrap px-2">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left" scope="col">
                <div className="flex items-center gap-2">
                  <input
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
                    type="checkbox"
                  />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider"
                scope="col"
              >
                User
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider"
                scope="col"
              >
                Role
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell"
                scope="col"
              >
                Department
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider"
                scope="col"
              >
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider hidden md:table-cell"
                scope="col"
              >
                Last Active
              </th>
              <th className="relative px-6 py-3" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div
                        className="h-10 w-10 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${user.avatar}")` }}
                      ></div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-text-main dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-text-muted dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.roleBg} ${user.roleColor}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400 hidden sm:table-cell">
                  {user.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      user.status
                    )}`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${getStatusDot(
                        user.status
                      )}`}
                    ></span>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted dark:text-gray-400 hidden md:table-cell">
                  {user.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-text-main dark:hover:text-white rounded-full p-1 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <a
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            href="#"
          >
            Previous
          </a>
          <a
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            href="#"
          >
            Next
          </a>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium text-text-main dark:text-white">
                1
              </span>{" "}
              to{" "}
              <span className="font-medium text-text-main dark:text-white">
                10
              </span>{" "}
              of{" "}
              <span className="font-medium text-text-main dark:text-white">
                2,543
              </span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              aria-label="Pagination"
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            >
              <a
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-700 dark:hover:bg-gray-700"
                href="#"
              >
                <span className="sr-only">Previous</span>
                <span className="material-symbols-outlined text-[20px]">
                  chevron_left
                </span>
              </a>
              <a
                aria-current="page"
                className="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href="#"
              >
                1
              </a>
              <a
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
                href="#"
              >
                2
              </a>
              <a
                className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
                href="#"
              >
                3
              </a>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-gray-400 dark:ring-gray-700">
                ...
              </span>
              <a
                className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
                href="#"
              >
                8
              </a>
              <a
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-700 dark:hover:bg-gray-700"
                href="#"
              >
                <span className="sr-only">Next</span>
                <span className="material-symbols-outlined text-[20px]">
                  chevron_right
                </span>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

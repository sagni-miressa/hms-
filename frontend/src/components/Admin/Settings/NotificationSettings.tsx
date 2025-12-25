import React from "react";

interface NotificationSettingsProps {
  notifications: {
    newApplication: boolean;
    candidateStatus: boolean;
    dailyDigest: boolean;
  };
  handleNotificationChange: (
    key: "newApplication" | "candidateStatus" | "dailyDigest"
  ) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  handleNotificationChange,
}) => {
  return (
    <section className="bg-white dark:bg-[#1c140d] rounded-xl p-6 shadow-sm border border-border-color dark:border-[#3a2d20]">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-main dark:text-white">
              Email Notifications
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Control when emails are sent to users and candidates.
            </p>
          </div>
          <span className="material-symbols-outlined text-text-secondary text-3xl opacity-20">
            mail
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-color dark:border-[#3a2d20] last:border-0">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-main dark:text-white">
                New Application Alerts
              </span>
              <span className="text-xs text-text-secondary">
                Notify hiring managers when a new candidate applies.
              </span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:border-primary transition-all duration-300 ease-in-out left-0 checked:right-0 checked:left-auto outline-none focus:outline-none"
                id="toggle1"
                name="toggle"
                type="checkbox"
                checked={notifications.newApplication}
                onChange={() => handleNotificationChange("newApplication")}
              />
              <label
                className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer transition-colors duration-300 ease-in-out dark:bg-gray-700"
                htmlFor="toggle1"
              ></label>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border-color dark:border-[#3a2d20] last:border-0">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-main dark:text-white">
                Candidate Status Updates
              </span>
              <span className="text-xs text-text-secondary">
                Send automated emails to candidates when their status changes.
              </span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:border-primary transition-all duration-300 ease-in-out left-0 checked:right-0 checked:left-auto outline-none focus:outline-none"
                id="toggle2"
                name="toggle"
                type="checkbox"
                checked={notifications.candidateStatus}
                onChange={() => handleNotificationChange("candidateStatus")}
              />
              <label
                className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer transition-colors duration-300 ease-in-out dark:bg-gray-700 checked:bg-primary"
                htmlFor="toggle2"
              ></label>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border-color dark:border-[#3a2d20] last:border-0">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-main dark:text-white">
                Daily Digest
              </span>
              <span className="text-xs text-text-secondary">
                Send a summary of daily activities to administrators at 8:00 AM.
              </span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:border-primary transition-all duration-300 ease-in-out left-0 checked:right-0 checked:left-auto outline-none focus:outline-none"
                id="toggle3"
                name="toggle"
                type="checkbox"
                checked={notifications.dailyDigest}
                onChange={() => handleNotificationChange("dailyDigest")}
              />
              <label
                className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer transition-colors duration-300 ease-in-out dark:bg-gray-700 checked:bg-primary"
                htmlFor="toggle3"
              ></label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

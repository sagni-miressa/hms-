import { useState } from "react";
import { GeneralSettings } from "@/components/Admin/Settings/GeneralSettings";
import { NotificationSettings } from "@/components/Admin/Settings/NotificationSettings";
import { IntegrationSettings } from "@/components/Admin/Settings/IntegrationSettings";
import { DataPrivacySettings } from "@/components/Admin/Settings/DataPrivacySettings";
import { SecuritySettings } from "@/components/Admin/Settings/SecuritySettings";

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const [appName, setAppName] = useState("RecruitSys");
  const [supportEmail, setSupportEmail] = useState("support@recruitsys.com");
  const [timeZone, setTimeZone] = useState(
    "(GMT-08:00) Pacific Time (US & Canada)"
  );
  const [currency, setCurrency] = useState("USD ($)");

  const [notifications, setNotifications] = useState({
    newApplication: false,
    candidateStatus: true,
    dailyDigest: true,
  });

  const [retention, setRetention] = useState({
    candidateData: 24,
    rejectedApps: 12,
    anonymize: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <GeneralSettings
            appName={appName}
            setAppName={setAppName}
            supportEmail={supportEmail}
            setSupportEmail={setSupportEmail}
            timeZone={timeZone}
            setTimeZone={setTimeZone}
            currency={currency}
            setCurrency={setCurrency}
          />
        );
      case "notifications":
        return (
          <NotificationSettings
            notifications={notifications}
            handleNotificationChange={handleNotificationChange}
          />
        );
      case "integrations":
        return <IntegrationSettings />;
      case "data":
        return (
          <DataPrivacySettings
            retention={retention}
            setRetention={setRetention}
          />
        );
      case "security":
        return <SecuritySettings />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black tracking-[-0.033em]">
            Admin Settings
          </h1>
          <p className="text-text-secondary text-base font-normal max-w-2xl">
            Configure system-wide preferences, manage notification channels, set
            up integrations, and define data policies.
          </p>
        </div>
        <div className="border-b border-border-color dark:border-[#3a2d20] overflow-x-auto">
          <nav aria-label="Tabs" className="flex gap-6 min-w-max">
            <button
              onClick={() => setActiveTab("general")}
              className={`border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "general"
                  ? "border-primary text-primary dark:text-primary-light font-bold"
                  : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "border-primary text-primary dark:text-primary-light font-bold"
                  : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={`border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "integrations"
                  ? "border-primary text-primary dark:text-primary-light font-bold"
                  : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Integrations
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "data"
                  ? "border-primary text-primary dark:text-primary-light font-bold"
                  : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Data & Privacy
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "security"
                  ? "border-primary text-primary dark:text-primary-light font-bold"
                  : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Security
            </button>
          </nav>
        </div>
      </div>

      {renderContent()}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button className="h-11 px-6 bg-white dark:bg-[#2a2016] border border-border-color dark:border-[#3a2d20] text-text-main dark:text-white text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-[#3a2d20] transition-colors">
          Cancel
        </button>
        <button className="h-11 px-8 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-primary/30 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">save</span>
          Save Changes
        </button>
      </div>
    </div>
  );
};

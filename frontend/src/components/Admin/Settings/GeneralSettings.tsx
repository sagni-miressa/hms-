import React from "react";

interface GeneralSettingsProps {
  appName: string;
  setAppName: (value: string) => void;
  supportEmail: string;
  setSupportEmail: (value: string) => void;
  timeZone: string;
  setTimeZone: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  appName,
  setAppName,
  supportEmail,
  setSupportEmail,
  timeZone,
  setTimeZone,
  currency,
  setCurrency,
}) => {
  return (
    <section className="bg-white dark:bg-[#1c140d] rounded-xl p-6 shadow-sm border border-border-color dark:border-[#3a2d20]">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-main dark:text-white">
              Application Preferences
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Basic system identity and localization settings.
            </p>
          </div>
          <span className="material-symbols-outlined text-text-secondary text-3xl opacity-20">
            tune
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-text-main dark:text-gray-200 mb-2">
              Application Name
            </label>
            <input
              className="w-full rounded-lg border-border-color dark:border-[#3a2d20] bg-background-light dark:bg-[#2a2016] text-text-main dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-text-main dark:text-gray-200 mb-2">
              Support Email
            </label>
            <input
              className="w-full rounded-lg border-border-color dark:border-[#3a2d20] bg-background-light dark:bg-[#2a2016] text-text-main dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-text-main dark:text-gray-200 mb-2">
              Default Time Zone
            </label>
            <select
              className="w-full rounded-lg border-border-color dark:border-[#3a2d20] bg-background-light dark:bg-[#2a2016] text-text-main dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            >
              <option>(GMT-08:00) Pacific Time (US & Canada)</option>
              <option>(GMT-05:00) Eastern Time (US & Canada)</option>
              <option>(GMT+00:00) London</option>
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-text-main dark:text-gray-200 mb-2">
              Currency
            </label>
            <select
              className="w-full rounded-lg border-border-color dark:border-[#3a2d20] bg-background-light dark:bg-[#2a2016] text-text-main dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-11 px-3"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

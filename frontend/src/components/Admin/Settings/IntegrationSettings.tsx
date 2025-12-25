
export const IntegrationSettings = () => {
  return (
    <section className="bg-white dark:bg-[#1c140d] rounded-xl p-6 shadow-sm border border-border-color dark:border-[#3a2d20]">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-main dark:text-white">
              Third-Party Integrations
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Connect with external tools and services.
            </p>
          </div>
          <span className="material-symbols-outlined text-text-secondary text-3xl opacity-20">
            extension
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-border-color dark:border-[#3a2d20] rounded-lg p-4 flex items-start gap-4">
            <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                calendar_month
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-text-main dark:text-white">
                  Google Calendar
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Connected
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                Sync interviews and events directly to your calendar.
              </p>
              <button className="text-xs font-medium text-text-secondary hover:text-primary transition-colors border border-border-color dark:border-[#3a2d20] rounded px-3 py-1.5 bg-background-light dark:bg-[#2a2016]">
                Manage Config
              </button>
            </div>
          </div>
          <div className="border border-border-color dark:border-[#3a2d20] rounded-lg p-4 flex items-start gap-4">
            <div className="size-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                chat
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-text-main dark:text-white">
                  Slack Notifications
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Disconnected
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                Push recruitment updates to specific Slack channels.
              </p>
              <button className="text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-colors rounded px-3 py-1.5 shadow-sm">
                Connect
              </button>
            </div>
          </div>
          <div className="border border-border-color dark:border-[#3a2d20] rounded-lg p-4 flex items-start gap-4">
            <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">
                videocam
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-text-main dark:text-white">
                  Zoom Integration
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Connected
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                Auto-generate Zoom links for scheduled interviews.
              </p>
              <button className="text-xs font-medium text-text-secondary hover:text-primary transition-colors border border-border-color dark:border-[#3a2d20] rounded px-3 py-1.5 bg-background-light dark:bg-[#2a2016]">
                Manage Config
              </button>
            </div>
          </div>
          <div className="border border-border-color dark:border-[#3a2d20] rounded-lg p-4 flex items-start gap-4">
            <div className="size-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">
                storage
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm text-text-main dark:text-white">
                  AWS S3 Storage
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Connected
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                Store candidate resumes and documents securely.
              </p>
              <button className="text-xs font-medium text-text-secondary hover:text-primary transition-colors border border-border-color dark:border-[#3a2d20] rounded px-3 py-1.5 bg-background-light dark:bg-[#2a2016]">
                Manage Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

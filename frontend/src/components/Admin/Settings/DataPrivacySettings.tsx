import React from "react";

interface DataPrivacySettingsProps {
  retention: {
    candidateData: number;
    rejectedApps: number;
    anonymize: boolean;
  };
  setRetention: React.Dispatch<
    React.SetStateAction<{
      candidateData: number;
      rejectedApps: number;
      anonymize: boolean;
    }>
  >;
}

export const DataPrivacySettings: React.FC<DataPrivacySettingsProps> = ({
  retention,
  setRetention,
}) => {
  return (
    <section className="bg-white dark:bg-[#1c140d] rounded-xl p-6 shadow-sm border border-border-color dark:border-[#3a2d20]">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-main dark:text-white">
              Data Retention Policy
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Configure how long data is kept before automatic deletion.
            </p>
          </div>
          <span className="material-symbols-outlined text-text-secondary text-3xl opacity-20">
            history
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-text-main dark:text-gray-200 mb-1">
              Candidate Data
            </label>
            <p className="text-xs text-text-secondary mb-2">
              Profiles not updated for:
            </p>
            <div className="flex items-center gap-2">
              <input
                className="w-24 rounded-lg border-border-color dark:border-[#3a2d20] bg-background-light dark:bg-[#2a2016] text-text-main dark:text-white text-sm h-10 px-3"
                type="number"
                value={retention.candidateData}
                onChange={(e) =>
                  setRetention({
                    ...retention,
                    candidateData: parseInt(e.target.value),
                  })
                }
              />
              <span className="text-sm text-text-main dark:text-gray-300">
                Months
              </span>
            </div>
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-text-main dark:text-gray-200 mb-1">
              Rejected Applications
            </label>
            <p className="text-xs text-text-secondary mb-2">
              Delete rejected application data after:
            </p>
            <div className="flex items-center gap-2">
              <input
                className="w-24 rounded-lg border-border-color dark:border-[#3a2d20] bg-background-light dark:bg-[#2a2016] text-text-main dark:text-white text-sm h-10 px-3"
                type="number"
                value={retention.rejectedApps}
                onChange={(e) =>
                  setRetention({
                    ...retention,
                    rejectedApps: parseInt(e.target.value),
                  })
                }
              />
              <span className="text-sm text-text-main dark:text-gray-300">
                Months
              </span>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 pt-4 border-t border-border-color dark:border-[#3a2d20]">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 min-w-4">
                <input
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  type="checkbox"
                  checked={retention.anonymize}
                  onChange={(e) =>
                    setRetention({
                      ...retention,
                      anonymize: e.target.checked,
                    })
                  }
                />
              </div>
              <div className="text-sm text-text-secondary">
                <span className="font-medium text-text-main dark:text-white">
                  Anonymize instead of delete.
                </span>{" "}
                Keep statistical data but remove personally identifiable
                information (PII).
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

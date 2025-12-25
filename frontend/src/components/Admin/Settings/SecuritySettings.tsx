
export const SecuritySettings = () => {
  return (
    <section className="bg-white dark:bg-[#1c140d] rounded-xl p-6 shadow-sm border border-border-color dark:border-[#3a2d20]">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-main dark:text-white">
              Security Settings
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Manage password policies and two-factor authentication.
            </p>
          </div>
          <span className="material-symbols-outlined text-text-secondary text-3xl opacity-20">
            security
          </span>
        </div>
        <div className="text-sm text-text-secondary">
          <p>Security settings content will be implemented here.</p>
        </div>
      </div>
    </section>
  );
};

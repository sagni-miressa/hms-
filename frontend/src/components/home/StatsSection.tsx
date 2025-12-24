export const StatsSection = () => {
  return (
    <section className="border-y border-[#e6e0db] dark:border-white/10 bg-white dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-center items-center">
          <div className="flex flex-col gap-1 items-center  text-center md:text-left">
            <p className="text-4xl font-bold text-text-main dark:text-white tracking-tight">
              50k+
            </p>
            <p className="text-sm font-medium text-text-muted dark:text-gray-400">
              Active Candidates
            </p>
          </div>
          <div className="flex flex-col gap-1 items-center  text-center md:text-left">
            <p className="text-4xl font-bold text-text-main dark:text-white tracking-tight">
              2,000+
            </p>
            <p className="text-sm font-medium text-text-muted dark:text-gray-400">
              Companies Hired
            </p>
          </div>
          <div className="flex flex-col gap-1 items-center  text-center md:text-left">
            <p className="text-4xl font-bold text-text-main dark:text-white tracking-tight">
              40%
            </p>
            <p className="text-sm font-medium text-text-muted dark:text-gray-400">
              Time Saved
            </p>
          </div>
          <div className="flex flex-col gap-1 items-center  text-center md:text-left">
            <p className="text-4xl font-bold text-text-main dark:text-white tracking-tight">
              150k+
            </p>
            <p className="text-sm font-medium text-text-muted dark:text-gray-400">
              Interviews Scheduled
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

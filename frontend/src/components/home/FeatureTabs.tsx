type Props = {
  activeTab: "recruiters" | "applicants";
  onChange: (tab: "recruiters" | "applicants") => void;
};

export const FeatureTabs = ({ activeTab, onChange }: Props) => (
  <section className="pt-20">
    <div className="flex justify-center mb-12">
      <div className="inline-flex border-b w-full sm:w-auto">
        <button
          onClick={() => onChange("recruiters")}
          className={`px-8 py-4 font-bold ${
            activeTab === "recruiters"
              ? "text-primary border-b-2 border-primary"
              : "text-text-muted"
          }`}
        >
          For Recruiters
        </button>
        <button
          onClick={() => onChange("applicants")}
          className={`px-8 py-4 font-bold ${
            activeTab === "applicants"
              ? "text-primary border-b-2 border-primary"
              : "text-text-muted"
          }`}
        >
          For Applicants
        </button>
      </div>
    </div>
  </section>
);

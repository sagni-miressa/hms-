import { Feature } from "@/types/feature";

export const FeatureGrid = ({ features }: { features: Feature[] }) => (
  <section className="pb-24">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((f, i) => (
        <div
          key={i}
          className="p-8 rounded-2xl bg-surface-light dark:bg-surface-dark"
        >
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-2xl">
              {f.icon}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-3">{f.title}</h3>
          <p className="text-text-muted">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

import { Link } from "react-router-dom";

export const FinalCTA = () => {
  return (
    <section className="py-24 bg-surface-light dark:bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-primary rounded-3xl p-12 overflow-hidden text-center">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
          <h2 className="relative text-3xl md:text-5xl font-black text-white mb-6">
            Ready to transform your hiring?
          </h2>
          <p className="relative text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join thousands of companies using RecruitSys to find better talent,
            faster. No credit card required.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary text-base font-bold rounded-xl shadow-xl hover:bg-gray-50 transition-colors"
            >
              Start Free Trial
            </Link>
            <button className="px-8 py-4 bg-primary-hover text-white border border-white/20 text-base font-bold rounded-xl hover:bg-black/10 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

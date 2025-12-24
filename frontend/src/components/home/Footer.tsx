export const Footer = () => {
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-[#f4f2f0] dark:border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-text-main dark:text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-xl">
                  work_history
                </span>
              </div>
              <span className="text-lg font-bold">RecruitSys</span>
            </div>
            <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed">
              Modern recruitment software for forward-thinking teams.
              Simplifying hiring from sourcing to onboarding.
            </p>
            <div className="flex gap-4 mt-2">
              <a
                className="text-text-muted hover:text-primary transition-colors"
                href="#"
              >
                Twitter
              </a>
              <a
                className="text-text-muted hover:text-primary transition-colors"
                href="#"
              >
                LinkedIn
              </a>
              <a
                className="text-text-muted hover:text-primary transition-colors"
                href="#"
              >
                Instagram
              </a>
            </div>
          </div>
          {/* Product */}
          <div>
            <h4 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider mb-6">
              Product
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                  href="#"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                  href="#"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                  href="#"
                >
                  Enterprise
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                  href="#"
                >
                  Case Studies
                </a>
              </li>
            </ul>
          </div>
          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider mb-6">
              Resources
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                  href="#"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                  href="#"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                  href="#"
                >
                  HR Templates
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                  href="#"
                >
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider mb-6">
              Stay Updated
            </h4>
            <p className="text-sm text-text-muted dark:text-gray-400 mb-4">
              Latest hiring trends delivered to your inbox.
            </p>
            <form className="flex gap-2">
              <input
                className="w-full bg-white dark:bg-background-dark border border-[#e6e0db] dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white placeholder-gray-400"
                placeholder="Email address"
                type="email"
              />
              <button
                className="bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-[#e6e0db] dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted dark:text-gray-500">
            © 2023 RecruitSys Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              className="text-sm text-text-muted dark:text-gray-500 hover:text-primary"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-sm text-text-muted dark:text-gray-500 hover:text-primary"
              href="#"
            >
              Terms
            </a>
            <a
              className="text-sm text-text-muted dark:text-gray-500 hover:text-primary"
              href="#"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

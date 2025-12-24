export const Testimonials = () => {
  return (
    <section className="py-20 bg-white dark:bg-surface-dark border-t border-[#f4f2f0] dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-text-main dark:text-white">
            Testimonials
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Review 1 */}
          <div className="flex flex-col justify-between p-8 bg-background-light dark:bg-background-dark rounded-2xl">
            <div>
              <div className="flex gap-1 text-primary mb-6">
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
              </div>
              <p className="text-text-main dark:text-gray-200 text-lg leading-relaxed italic mb-8">
                "RecruitSys cut our time-to-hire by 40%. The visual pipelines
                make it incredibly easy to see where every candidate stands."
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full bg-gray-300 bg-cover bg-center"
                data-alt="Headshot of Sarah Jenkins"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCaHDK2EhoH8--fuMflE8q8DefSm7b3Lw8VjetH0KUWBG1KydfLxZiMQS2unvWnwhQRoEAiyniujUiepOUgCn0w7OP6S_ZZZgkq9BQNqCxE0c-fxL_0367_aAM7zdLFAbrVjqmqpBAxRpvZZYEgyI-qgEmc-EuWnydWVinc4e54GKvZXW5vtjG5EPxyB-eGezuEpeLcWvq5-cTRdpPNaBqM8_gucH8ECDJ0P2axKjCnLU1TeLThzbdoTG_869t2cn6GCkAVHps1BQ')",
                }}
              ></div>
              <div>
                <p className="font-bold text-text-main dark:text-white text-sm">
                  Sarah Jenkins
                </p>
                <p className="text-xs text-text-muted dark:text-gray-400">
                  Head of People, TechFlow
                </p>
              </div>
            </div>
          </div>
          {/* Review 2 */}
          <div className="flex flex-col justify-between p-8 bg-background-light dark:bg-background-dark rounded-2xl">
            <div>
              <div className="flex gap-1 text-primary mb-6">
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
              </div>
              <p className="text-text-main dark:text-gray-200 text-lg leading-relaxed italic mb-8">
                "The automated scheduling feature is a lifesaver. I no longer
                spend half my day coordinating interview times."
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full bg-gray-300 bg-cover bg-center"
                data-alt="Headshot of Michael Chen"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXQ2R8eUX92f5Onu1W69RXPOr56enb3whhZvhHcRZvDGRkWVGpGQqALypKLBg89vaN8b0S82w6TbiIw_QYYSeIkgOTqB0TLOTYRvCHZZQcEYR17MF1UyO3G-5BMjV1NbH4umSdnb69JFvhgWGKWPM6yOVSLSSfnY1ZcpnHkmH_O17kbjW1sNA2iFTEzgucbQ5CqwcexOpOA9YN0_h97uOTZAnnxL_T-K1bn8CXfr3y5YSjt9R8l4abuXuANUxxMPNP0QLxDHwHsQ')",
                }}
              ></div>
              <div>
                <p className="font-bold text-text-main dark:text-white text-sm">
                  Michael Chen
                </p>
                <p className="text-xs text-text-muted dark:text-gray-400">
                  Recruiter, StartupInc
                </p>
              </div>
            </div>
          </div>
          {/* Review 3 */}
          <div className="flex flex-col justify-between p-8 bg-background-light dark:bg-background-dark rounded-2xl">
            <div>
              <div className="flex gap-1 text-primary mb-6">
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">star</span>
                <span className="material-symbols-outlined text-lg">
                  star_half
                </span>
              </div>
              <p className="text-text-main dark:text-gray-200 text-lg leading-relaxed italic mb-8">
                "Finally, a system that looks good and actually works. The
                analytics dashboard helps me prove ROI to leadership."
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full bg-gray-300 bg-cover bg-center"
                data-alt="Headshot of Elena Rodriguez"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA4GMGUeQEGYFYQpXBA6EM72YXkg2R9mOiAxW41q-78rMK_dBAlecB9NDx6MAUnqP3S0ou8LMnBIuNlShkZeJSv8aUJwPcdUS0-ukjISlUjPuMK-zRA-f5Yzdap8OPLGe3uEqe-Dgp-HMoY1ME9kZRdr5a54i-FEk3GrcOGI7Vvnyvw-8xkczssfupxVQYsIuwLwkYGf9geNFE0mbJEgVViwe0OZv31axqfOjKTSrkqY9SW5T9EYs7Q5HsHhNhBXj0X_fYPh2b7bw')",
                }}
              ></div>
              <div>
                <p className="font-bold text-text-main dark:text-white text-sm">
                  Elena Rodriguez
                </p>
                <p className="text-xs text-text-muted dark:text-gray-400">
                  HR Manager, Global Corp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

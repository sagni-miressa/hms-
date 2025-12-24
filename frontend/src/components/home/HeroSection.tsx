import { Link } from "react-router-dom";

export const HeroSection = () => (
  <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32">
    <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
      <div className="flex flex-col gap-6 text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
          Hiring Made Human.
          <br />
          <span className="text-primary">Efficiency</span> for HR,
          <br />
          <span className="text-primary">Simplicity</span> for Talent.
        </h1>

        <p className="text-text-muted max-w-2xl">
          The all-in-one platform connecting top talent with dream companies.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link
            to="/register"
            className="px-8 py-2 bg-primary text-white font-bold rounded-xl"
          >
            Start Hiring
          </Link>
          <Link to="/jobs" className="px-8 py-2 border rounded-xl font-bold">
            Find a Job
          </Link>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative lg:h-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-surface-light dark:bg-surface-dark aspect-[4/3] group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay z-10 pointer-events-none"></div>
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            data-alt="Diverse team working together in a modern office environment"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEwUFNRMZX9GyImI3Zn5chjl3FjTf0AjQnmZomquu9Yg814NYbRhnRtBd-1dJors_1Kz7VLLhAHexQBxSQaDJUYIUYn357NqndLl96H-NxbibSSZA0LCVAD7lEoVEskZSKag3sihjV772OhV_dJIw3iJXexxhxKSKN-aCmwUnjfAEosf6Z88RrPAjwZ1u6qc7HynmzJReS9LW6IOkOlIz_YlMdcKkq7utMHC0rSC2H_wQPi-LreVWgPGIwuBEuXwSMfQiKAjUglA')",
            }}
          ></div>
          {/* Floating Card 1 */}
          <div
            className="absolute top-8 left-8 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-lg z-20 max-w-[200px]"
            style={{ animationDuration: "3s" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Status</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Offer Accepted
                </p>
              </div>
            </div>
          </div>
          {/* Floating Card 2 */}
          <div className="absolute bottom-8 right-8 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-lg z-20 max-w-[240px]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase">
                New Candidates
              </p>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">
                +12
              </span>
            </div>
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded-full bg-gray-100 bg-cover"
                data-alt="Candidate avatar"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCcfKfQJ2_E14FyOJFgNoH6W9nryOSEdhBT2pyUUwmXJ1j_Sq-BAejQ8gWz3KNv4tIFnH5hmePK5k8iBZstVLzV8drgeDryB2FZBQOBFNHNTt2t7sG2_J75DCX1GjyNfcPG_kfQmoEZzDh92Kymmq_opOSh1bZ8Kdpx5vPmdcQuWLD3wyU9I3yU9ztcjy4LW9SDdwWEJeTSwphJBsXNLCmYdUAxOFnsa92ngylJLcwR5XbGeactZJgeH-s2Pu7zEfw7xTuAJ5XE6g')",
                }}
              ></div>
              <div
                className="w-8 h-8 rounded-full bg-gray-100 bg-cover"
                data-alt="Candidate avatar"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBU-oQAvwZqhnB82IXabtleaRoWbw4RymvOTMoCz19-d_z0JIOoPnFLEUlILpBZH8wP0-8QTWUZ64UH8-OF9bGIGsX1O9B5vXuHSnaLee76qDzTBU8O_10i2vM-HV6EUOC1sTLZd0VkeiLYT_t5oHlTMdh6fwLL1VRZ8bzl-BblxLh2jg-M8AfgbmwL12Xy6qLUZ4rFN60nfmoTPNvPYJykl-WfNTM1sZQEZInILZrbBL82qBFWgvxIDNFfdPxefVNP_tfGB5baQA')",
                }}
              ></div>
              <div
                className="w-8 h-8 rounded-full bg-gray-100 bg-cover"
                data-alt="Candidate avatar"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvns2m2Ya15LVtYwnTTbzbbOjuh1kHBOXykkhtU0THuNl4EUaKPdnXkjB-PTdlvXDkCXtw_lNvI7yHqPJ5NdT265q9kt_5yPZHiTfNfO9ahbhNaaKwmNMKkfqTKaXtuKQ9VY6T56FSzE4O3XSVl4nX14LcLsjoMLE2h224my61m_Md618LTI32FSJPCmYmXPCspDsycxtEBXJb-fGvgaZniGHhGiEX-rFPWGeCMsJYSppjud4ks50dXYNoqO3Hh75la_UlAgaWrg')",
                }}
              ></div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                +9
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

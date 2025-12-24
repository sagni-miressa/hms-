import { Link } from "react-router-dom";

export const CandidateTeaserCard = () => {
  return (
    <div className="px-28 pb-20">
      <div className="mt-16 bg-gradient-to-br from-[#221910] to-[#3a2d20] rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              For Candidates
            </span>
            <h3 className="text-3xl font-bold text-white mb-4">
              Looking for your next opportunity?
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              Build a standout profile, track your applications in real-time,
              and get matched with companies that share your values.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-200">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                One-click applications
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                Real-time status updates
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                Direct chat with recruiters
              </li>
            </ul>
            <Link
              to="/register"
              className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Create Free Profile
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          {/* Image / Background */}
          <div className="order-1 lg:order-2 relative h-64 lg:h-full min-h-[300px] rounded-xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAiWalRdAG-m5-r-cyW0XSCxJS1bf_iXnMaKbvth5EckRROaIFcZdWZO5mfK4fnDOEYpIACvQKF663YJDB3rUKfQBQHnZU_mXftnjG1RAvBPCUUssZaLNdeQzR49jUesi1wmjIz_ZNAmVigkvN5wlL5lzWSDcqD3SMC3RjwoT4k03WjhpYRBCOnELd8gdbXv3yqb7V9NbWghRReJSzCNMQpgb0-KAFDPOsimdHV6nvoeDC0DISWa9t65xCao9RHVmJ109IvqOkO_A')",
              }}
              aria-label="Candidate using laptop in a cafe"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

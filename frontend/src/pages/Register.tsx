import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff, Users } from "lucide-react";
import { register as registerUser } from "@/services/auth.service";
import { Recaptcha } from "@/components/Recaptcha";
import { LogoIcon } from "@/components/icons/LogoIcon";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get reCAPTCHA site key from environment
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
  // Use v2 (checkbox) for reCAPTCHA
  const recaptchaVersion = "v2" as "v2" | "v3";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (_, variables) => {
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: any) => {
      // Reset reCAPTCHA on error
      if (recaptchaVersion === "v2" && window.grecaptcha) {
        window.grecaptcha.reset();
        setRecaptchaToken(null);
      }

      const errorMessage =
        error?.response?.data?.error?.message ||
        "Registration failed. Please try again.";
      if (error?.response?.data?.error?.code === "RECAPTCHA_FAILED") {
        toast.error("reCAPTCHA verification failed. Please try again.");
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const onSubmit = (data: RegisterForm) => {
    const { fullName, email, password } = data;

    // If reCAPTCHA is configured, require token
    if (recaptchaSiteKey && !recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }

    registerMutation.mutate({
      fullName,
      email,
      password,
      recaptchaToken: recaptchaToken || undefined,
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-recruit-bg-light">
      {/* Left Panel - Registration Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-start px-8 py-12 sm:px-12 lg:px-24 xl:px-32 bg-white h-screen overflow-y-auto">
        <div className=" flex items-center gap-3 mb-10">
          <div className="flex items-center justify-center size-8 rounded bg-primary-500/10 text-primary-500">
            <LogoIcon />
          </div>
          <h2 className="text-gray-900 text-lg font-bold">RecruitHub</h2>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h1 className="text-gray-900 text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
              Create an Account
            </h1>
            <p className="text-gray-500 text-base font-normal leading-normal">
              Join to start managing your recruitment pipeline.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block mb-2">
                <p className="text-gray-900 text-sm font-semibold leading-normal pb-1">
                  Full Name
                </p>
                <input
                  {...register("fullName")}
                  type="text"
                  placeholder="e.g. John Doe"
                  className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 bg-white border h-12 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal transition-colors focus:outline-none focus:ring-1 ${
                    errors.fullName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </label>
            </div>

            {/* Email Input */}
            <div>
              <label className="block mb-2">
                <p className="text-gray-900 text-sm font-semibold leading-normal pb-1">
                  Email Address
                </p>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 bg-white border h-12 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal transition-colors focus:outline-none focus:ring-1 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </label>
            </div>

            {/* Password Input */}
            <div>
              <label className="block mb-2">
                <div className="flex justify-between items-center pb-1">
                  <p className="text-gray-900 text-sm font-semibold leading-normal">
                    Password
                  </p>
                </div>
                <div className="relative flex w-full items-stretch rounded-lg">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 bg-white border h-12 placeholder:text-gray-400 p-[15px] pr-10 text-base font-normal leading-normal transition-colors focus:outline-none focus:ring-1 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </label>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block mb-2">
                <div className="flex justify-between items-center pb-1">
                  <p className="text-gray-900 text-sm font-semibold leading-normal">
                    Confirm Password
                  </p>
                </div>
                <div className="relative flex w-full items-stretch rounded-lg">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 bg-white border h-12 placeholder:text-gray-400 p-[15px] pr-10 text-base font-normal leading-normal transition-colors focus:outline-none focus:ring-1 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </label>
            </div>

            {/* reCAPTCHA */}
            {recaptchaSiteKey && (
              <div className="py-2 flex justify-center">
                <Recaptcha
                  siteKey={recaptchaSiteKey}
                  version={recaptchaVersion}
                  action="register"
                  onChange={(token) => setRecaptchaToken(token)}
                  onError={(error) => {
                    console.error("reCAPTCHA error:", error);
                    toast.error(
                      "reCAPTCHA verification error. Please refresh the page."
                    );
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                registerMutation.isPending ||
                (recaptchaSiteKey && !recaptchaToken)
              }
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary-500 hover:bg-primary-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {registerMutation.isPending ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <span className="truncate">Sign Up</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200" />
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-medium tracking-wider">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  try {
                    const apiUrl =
                      import.meta.env.VITE_API_URL ||
                      "http://localhost:5000/api/v1";
                    const googleAuthUrl = `${apiUrl}/auth/google`;
                    console.log("Redirecting to:", googleAuthUrl);
                    window.location.href = googleAuthUrl;
                  } catch (error) {
                    console.error("Error initiating Google OAuth:", error);
                    toast.error("Failed to initiate Google login");
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white h-12 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white h-12 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <LinkedInIcon />
                <span>LinkedIn</span>
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-primary-500 hover:text-primary-600 transition-colors ml-1"
                >
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      {/* Right Panel - Image (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-recruit-bg-dark overflow-hidden items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Office meeting"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIoP0qZhNjBXaC8ZuN3v6NOdpt7uag80KRxEVycFtgjjcrKAyPyGYM845g8de9wg5zGirhODxGTkoNrdrSe-_b4IVBn9QkV31YSIHLsZoDD7jcfTHOf0TXFjemPMKJK7_x6xkJ5ov9koBVp47UhnTDN3LFOP12hsJwYuZ84qlrLTpOCFAuOIsy-i9MqbdYkxfSXf5OsQLp6pwjiD8wtgs2txaZkOX5XtnwaooXCwfLssWMSA5No2XjNWDX1uqrBrFAlt5OtqgamQ"
          />
        </div>
        {/* Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/80 to-[#221910]/90 z-10" />
        {/* Content Overlay */}
        <div className="relative z-20 max-w-lg px-2 text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
              <Users className="size-14 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            The future of recruitment starts here.
          </h2>
          <p className="text-lg text-white/80 font-light leading-relaxed mb-10">
            "RecruitHub transformed our hiring process. We found the perfect
            candidates in record time."
          </p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl z-0 pointer-events-none" />
      </div>
    </div>
  );
};

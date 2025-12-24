import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Shield, Eye, EyeOff, Check, Rocket } from "lucide-react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import { getCurrentUser } from "@/services/auth.service";
import { LogoIcon } from "@/components/icons/LogoIcon";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  mfaToken: z.string().length(6, "MFA token must be 6 digits").optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      if (data.requiresMFA) {
        setRequiresMFA(true);
        toast("Please enter your MFA code", { icon: "🔐" });
        return;
      }

      // Set tokens first so getCurrentUser can use them
      const { setTokens } = useAuthStore.getState();
      setTokens(data.accessToken, data.refreshToken);

      // Get user info
      try {
        const userResponse = await getCurrentUser();
        setAuth(userResponse.user, data.accessToken, data.refreshToken);
        toast.success("Login successful!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast.error("Failed to load user profile");
        // Clear tokens if getting user fails
        useAuthStore.getState().logout();
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
      setRequiresMFA(false);
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
      mfaToken: data.mfaToken,
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-recruit-bg-light">
      {/* Left Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-recruit-bg-dark overflow-hidden items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Office meeting"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY82e6vlK1g6JL1BuW380XeGFIhx2uc4t4Nh6oVQCcsQAmWUK5gqQsn4aockKIicZGvJ2ThGK6TDaiN1QxwmmgvEKIEIaGa4NcxuPsD6y5HyJt9q0R27H4P75z7R4cL-JVcMx-iqh1cyKxLpIGuzSgeDT6MNA56uMJ3BMg8sZcYz_y0krn83UW_reyAu4Tb5oHn4rFLI8QsHKMoo-C3moIZQtzHmFImmq_89cwThJXuD0AnqU4ErcapHNyzdrs65aGqnRyKcPtyQ"
          />
        </div>
        {/* Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/80 to-[#221910]/90 z-10" />
        {/* Content Overlay */}
        <div className="relative z-20 max-w-lg px-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
              <Rocket className="size-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Start your journey to success today.
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

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-12 lg:px-24 xl:px-32 bg-white h-screen overflow-y-auto">
        {/* Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="flex items-center justify-center size-8 rounded bg-primary-500/10 text-primary-500">
            <LogoIcon />
          </div>
          <h2 className="text-gray-900 text-lg font-bold">RecruitHub</h2>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-10 mx-auto text-center">
            <h1 className="text-gray-900 text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-base font-normal leading-normal">
              Sign in to access your recruitment dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

            {/* MFA Code Input */}
            {requiresMFA && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900">
                      MFA Required
                    </h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Please enter the 6-digit code from your authenticator app
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    {...register("mfaToken")}
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="off"
                    autoFocus
                    className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 bg-white border h-12 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal transition-colors focus:outline-none focus:ring-1 ${
                      errors.mfaToken
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    }`}
                  />
                  {errors.mfaToken && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.mfaToken.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`h-4 w-4 rounded border transition-colors flex items-center justify-center ${
                      rememberMe
                        ? "bg-primary-500 border-primary-500"
                        : "border-gray-300 bg-transparent group-hover:border-gray-400"
                    }`}
                  >
                    {rememberMe && <Check className="size-3 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary-500 hover:bg-primary-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
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
                <span className="truncate">
                  {requiresMFA ? "Verify & Sign In" : "Sign In"}
                </span>
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
                className="flex items-center justify-center gap-3 w-full h-12 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-900 font-medium text-sm"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 w-full h-12 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-900 font-medium text-sm"
              >
                <LinkedInIcon />
                LinkedIn
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-primary-500 hover:text-primary-600 transition-colors ml-1"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

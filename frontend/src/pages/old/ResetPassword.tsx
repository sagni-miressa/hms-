import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { LogoIcon } from "@/components/icons/LogoIcon";
import { resetPassword } from "@/services/auth.service";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      )
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid reset link. Please request a new password reset.");
      navigate("/forgot-password");
    }
  }, [token, email, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { password: string }) => {
      if (!token || !email) {
        throw new Error("Missing token or email");
      }
      return resetPassword({
        token,
        email,
        newPassword: data.password,
      });
    },
    onSuccess: () => {
      toast.success(
        "Password reset successfully. Please log in with your new password."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to reset password. Please try again.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    resetPasswordMutation.mutate({ password: data.password });
  };

  if (!token || !email) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-recruit-bg-light relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100 via-transparent to-transparent" />

      {/* Central Card Container */}
      <div className="relative w-full max-w-[480px] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header Section with Logo */}
        <div className="pt-10 pb-2 flex justify-center">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center size-8 rounded bg-primary-500/10 text-primary-500">
              <LogoIcon />
            </div>
            <h2 className="text-gray-900 text-lg font-bold">RecruitHub</h2>
          </div>
        </div>

        {/* Page Heading */}
        <div className="px-8 pb-4 text-center">
          <h1 className="text-gray-900 text-3xl font-black leading-tight tracking-[-0.033em] mb-3">
            Set new password
          </h1>
          <p className="text-[#897561] text-base font-normal leading-relaxed">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-4 flex flex-col gap-5">
          {/* New Password Input */}
          <label className="flex flex-col w-full group">
            <p className="text-gray-900 text-sm font-semibold leading-normal pb-1">
              New Password
            </p>
            <div className="relative flex w-full items-center">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`peer flex w-full resize-none overflow-hidden rounded-lg text-gray-900 border bg-white h-14 pl-4 pr-12 text-base font-normal leading-normal shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-[#897561]/60 transition-all duration-200 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-[#897561] peer-focus:text-primary-500 hover:text-gray-700 transition-colors duration-200 flex items-center"
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

          {/* Confirm Password Input */}
          <label className="flex flex-col w-full group">
            <p className="text-gray-900 text-sm font-semibold leading-normal pb-1">
              Confirm New Password
            </p>
            <div className="relative flex w-full items-center">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`peer flex w-full resize-none overflow-hidden rounded-lg text-gray-900 border bg-white h-14 pl-4 pr-12 text-base font-normal leading-normal shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-[#897561]/60 transition-all duration-200 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 text-[#897561] peer-focus:text-primary-500 hover:text-gray-700 transition-colors duration-200 flex items-center"
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

          {/* Password Requirements */}
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
            <p className="text-gray-900 text-xs font-bold uppercase tracking-wide mb-2">
              Password requirements
            </p>
            <ul className="flex flex-col gap-1.5">
              <li className="flex items-center gap-2 text-sm text-[#897561]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500/40"></span>
                Minimum 8 characters
              </li>
              <li className="flex items-center gap-2 text-sm text-[#897561]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500/40"></span>
                At least one special character
              </li>
              <li className="flex items-center gap-2 text-sm text-[#897561]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500/40"></span>
                At least one number
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-2">
            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={resetPasswordMutation.isPending}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPasswordMutation.isPending ? (
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
                <span className="truncate">Set Password</span>
              )}
            </button>

            {/* Back Link */}
            <Link
              to="/login"
              className="group flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-transparent text-[#897561] hover:text-gray-900 transition-colors duration-200 text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="truncate">Back to log in</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center relative z-10">
        <p className="text-xs text-[#897561]/70">
          © 2024 RecruitHub Inc. Need help?{" "}
          <a
            href="#"
            className="underline hover:text-primary-500 transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

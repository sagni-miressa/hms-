import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Mail, ArrowLeft } from "lucide-react";
import { LogoIcon } from "@/components/icons/LogoIcon";
import { forgotPassword } from "@/services/auth.service";
import { Button, Input } from "@/components/ui";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      toast.success(
        "If an account exists with this email, reset instructions have been sent."
      );
      // Optionally navigate back to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to send reset instructions. Please try again.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data.email);
  };

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
            Forgot password?
          </h1>
          <p className="text-primary/60 text-sm px-2 font-normal leading-relaxed">
            Enter the email associated with your account and we will send you an
            email with instructions to reset your password.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-4 flex flex-col gap-12">
          {/* Email Input Field */}
          <label className="flex flex-col w-full group">
            <p className="text-gray-900 text-sm font-bold leading-normal pb-2 uppercase tracking-wide">
              Email address
            </p>
            <div className="relative flex w-full items-center">
              <Input
                {...register("email")}
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                className={`h-12 ${errors.email ? "border-destructive focus:ring-destructive" : ""}`}
              />
              <div className="absolute right-4 peer-focus:text-primary-500 transition-colors duration-200 pointer-events-none flex items-center">
                <Mail className="size-5" />
              </div>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {/* Submit Button */}
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
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
                <span className="truncate">Send Reset Instructions</span>
              )}
            </Button>

            {/* Back Link */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm hover:text-primary-500 transition-colors hover:underline"
            >
              <ArrowLeft className="size-4" />
              <span className="truncate">Back to log in</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      {/* <div className="mt-8 text-center relative z-10">
        <p className="text-xs text-[#897561]/70">
          © 2025 RecruitHub Inc. Need help?{" "}
          <a
            href="#"
            className="underline hover:text-primary-500 transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div> */}
    </div>
  );
};

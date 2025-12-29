import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, memo } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/Logo";
import { resetPassword } from "@/services/auth.service";
import officeSecurity from "@/assets/office-security.jpg";

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

const BrandingPanel = memo(() => (
  <div className="hidden lg:flex lg:w-1/2 bg-primary sticky top-0 overflow-hidden h-screen">
    {/* Background Image - Full Coverage */}
    <div className="absolute inset-0 z-0">
      <img
        alt="Office security"
        className="w-full h-full object-cover"
        src={officeSecurity}
      />
    </div>

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/90 to-primary/80 z-10" />

    {/* Content Layer */}
    <div className="relative z-20 flex flex-col justify-between p-12 text-primary-foreground w-full">
      <Logo />

      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Secure your account
            <br />
            with a strong password.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90 max-w-md">
            "Your security is our top priority. We use industry-standard
            encryption to protect your data."
          </p>
        </div>
      </div>

      <p className="text-sm text-primary-foreground/60">
        © 2025 RecruitHub. All rights reserved.
      </p>
    </div>

    {/* Decorative Elements */}
    <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl z-[5]" />
    <div className="absolute -right-16 top-1/4 w-64 h-64 rounded-full bg-primary-foreground/10 blur-2xl z-[5]" />
  </div>
));

BrandingPanel.displayName = "BrandingPanel";

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
    <div className="h-screen flex overflow-hidden">
      <BrandingPanel />

      {/* Right Panel - Form Section */}
      <div className="flex-1 bg-background overflow-y-auto scrollbar-hide h-full">
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in my-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-foreground">
                Set new password
              </h1>
              <p className="mt-2 text-muted-foreground">
                Choose a strong and secure password that you haven't used
                before.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4 text-left">
                {/* New Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`h-12 pr-12 ${
                        errors.password
                          ? "border-destructive focus:ring-destructive"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`h-12 pr-12 ${
                        errors.confirmPassword
                          ? "border-destructive focus:ring-destructive"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Requirements Banner */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      Password Requirements
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-1 rounded-full bg-primary/40" />
                        Minimum 8 characters
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-1 rounded-full bg-primary/40" />
                        At least one special character
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-1 rounded-full bg-primary/40" />
                        At least one number
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 gap-2"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Set New Password
                    </>
                  )}
                </Button>

                <Link
                  to="/login"
                  className="group flex w-full items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium h-10"
                >
                  <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                  Back to login
                </Link>
              </div>
            </form>

            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground/60">
                © 2025 RecruitHub. Having trouble?{" "}
                <a
                  href="#"
                  className="underline hover:text-primary transition-colors"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

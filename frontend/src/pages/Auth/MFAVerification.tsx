import { useState } from "react";
import {
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Building2, Shield, ArrowLeft, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth.service";
import { loginWithBiometric } from "@/services/webauthn.service";
import { useAuthStore } from "@/stores/authStore";
import { getCurrentUser } from "@/services/auth.service";
import { LogoIcon } from "@/components/icons/LogoIcon";

const mfaSchema = z.object({
  mfaToken: z.string().length(6, "MFA token must be 6 digits"),
});

type MFAForm = z.infer<typeof mfaSchema>;

export const MFAVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuthStore();

  // Get state from location or URL params (for OAuth flow)
  const [searchParams] = useSearchParams();
  const email = location.state?.email || searchParams.get("email");
  const password = location.state?.password;
  const isOAuth =
    location.state?.isOAuth || searchParams.get("isOAuth") === "true";
  const tempToken = location.state?.tempToken || searchParams.get("tempToken");

  // Redirect to login if no way to verify
  if (!email || (!password && !tempToken)) {
    navigate("/login");
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MFAForm>({
    resolver: zodResolver(mfaSchema),
  });

  const biometricLoginMutation = useMutation({
    mutationFn: loginWithBiometric,
    onSuccess: async (data) => {
      const { setTokens } = useAuthStore.getState();
      setTokens(data.accessToken, data.refreshToken);

      try {
        const userResponse = await getCurrentUser();
        setAuth(userResponse.user, data.accessToken, data.refreshToken);
        toast.success("Biometric login successful!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast.error("Failed to load user profile");
        useAuthStore.getState().logout();
      }
    },
    onError: (error: any) => {
      console.error("Biometric login error:", error);
      toast.error(
        error?.response?.data?.error?.message || "Biometric login failed"
      );
    },
  });

  const mfaLoginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      const { setTokens } = useAuthStore.getState();
      setTokens(data.accessToken, data.refreshToken);

      try {
        const userResponse = await getCurrentUser();
        setAuth(userResponse.user, data.accessToken, data.refreshToken);
        toast.success("Login successful!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast.error("Failed to load user profile");
        useAuthStore.getState().logout();
      }
    },
    onError: (error: any) => {
      console.error("MFA verification error:", error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        "MFA verification failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: MFAForm) => {
    mfaLoginMutation.mutate({
      email,
      password,
      mfaToken: data.mfaToken,
      tempToken: tempToken || undefined,
    });
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary sticky top-0 overflow-hidden h-screen">
        {/* Background Image - Full Coverage */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Office meeting"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY82e6vlK1g6JL1BuW380XeGFIhx2uc4t4Nh6oVQCcsQAmWUK5gqQsn4aockKIicZGvJ2ThGK6TDaiN1QxwmmgvEKIEIaGa4NcxuPsD6y5HyJt9q0R27H4P75z7R4cL-JVcMx-iqh1cyKxLpIGuzSgeDT6MNA56uMJ3BMg8sZcYz_y0krn83UW_reyAu4Tb5oHn4rFLI8QsHKMoo-C3moIZQtzHmFImmq_89cwThJXuD0AnqU4ErcapHNyzdrs65aGqnRyKcPtyQ"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/90 to-primary/80 z-10" />

        {/* Content Layer */}
        <div className="relative z-20 flex flex-col justify-between p-12 text-primary-foreground w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <LogoIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold">RecruitHub</h1>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight">
                Enhanced security
                <br />
                for your peace of mind.
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/90 max-w-md">
                Two-factor authentication adds an extra layer of protection to
                your account.
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

      {/* Right Panel - MFA Form */}
      <div className="flex-1 bg-background overflow-y-auto scrollbar-hide h-full">
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in my-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  RecruitHub
                </h1>
              </div>
            </div>

            {/* Back Button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>

            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                {isOAuth
                  ? "Google Account Verification"
                  : "Two-Factor Authentication"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Signing in as:{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* MFA Info Banner */}
              <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      Verification Required
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open your authenticator app (Google Authenticator, Authy,
                      etc.) and enter the 6-digit code.
                    </p>
                  </div>
                </div>
              </div>

              {/* MFA Code Input */}
              <div className="space-y-2">
                <Label htmlFor="mfaToken">Authentication Code</Label>
                <Input
                  id="mfaToken"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                  {...register("mfaToken")}
                  className={`h-14 text-center text-2xl tracking-[0.5em] font-mono ${
                    errors.mfaToken
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
                {errors.mfaToken && (
                  <p className="text-sm text-destructive">
                    {errors.mfaToken.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 gap-2"
                disabled={mfaLoginMutation.isPending}
              >
                {mfaLoginMutation.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </form>

            {/* Biometric Alternative */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or use biometric
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => biometricLoginMutation.mutate(email)}
                disabled={biometricLoginMutation.isPending}
                className="w-full h-12 gap-2"
              >
                <Fingerprint className="h-5 w-5" />
                {biometricLoginMutation.isPending
                  ? "Verifying..."
                  : "Use Fingerprint / Face ID"}
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Lost access to your authenticator?{" "}
                <Link
                  to="/support"
                  className="text-primary hover:underline font-semibold"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

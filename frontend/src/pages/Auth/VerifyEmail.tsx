import { useState, useEffect, useRef, memo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { verifyEmail, resendVerification } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/Logo";

const verifySchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

type VerifyForm = z.infer<typeof verifySchema>;

const BrandingPanel = memo(() => (
  <div className="hidden lg:flex lg:w-1/2 bg-primary sticky top-0 overflow-hidden h-screen">
    {/* Background Image - Full Coverage */}
    <div className="absolute inset-0 z-0">
      <img
        alt="Office workplace"
        className="w-full h-full object-cover"
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
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
            Verify your identity
            <br />
            to get started.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90 max-w-md">
            "We take your account security seriously. Verifying your email
            ensures that only you can access your data."
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

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const {
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      toast.success("Email verified successfully! You can now log in.");
      navigate("/login", { state: { verified: true } });
    },
    onError: (error: any) => {
      const errorCode = error?.response?.data?.error?.code;
      const errorMessage =
        error?.response?.data?.error?.message ||
        "Verification failed. Please try again.";

      if (errorCode === "CODE_EXPIRED") {
        toast.error("Verification code has expired. Please request a new one.");
      } else if (errorCode === "ALREADY_VERIFIED") {
        toast.success("Email already verified. You can now log in.");
        navigate("/login");
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      toast.success("Verification code sent! Please check your email.");
      setCanResend(false);
      setResendCooldown(60); // 60 second cooldown
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error?.message ||
        "Failed to resend verification code. Please try again.";
      toast.error(errorMessage);
    },
  });

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCooldown, canResend]);

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    clearErrors("code");

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    if (newCode.every((digit) => digit !== "") && index === 5) {
      const fullCode = newCode.join("");
      verifyMutation.mutate({
        code: fullCode,
        email: email,
      });
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedText)) {
      const newCode = pastedText.split("").slice(0, 6);
      while (newCode.length < 6) {
        newCode.push("");
      }
      setCode(newCode);
      clearErrors("code");

      const lastFilledIndex = Math.min(newCode.length - 1, 5);
      inputRefs[lastFilledIndex].current?.focus();

      if (pastedText.length === 6 && email) {
        verifyMutation.mutate({
          code: pastedText,
          email: email,
        });
      }
    }
  };

  const onSubmit = () => {
    if (!email) {
      toast.error("Email address is required");
      navigate("/register");
      return;
    }

    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      setError("code", {
        type: "manual",
        message: "Code must be 6 digits",
      });
      return;
    }

    if (!/^\d+$/.test(fullCode)) {
      setError("code", {
        type: "manual",
        message: "Code must contain only numbers",
      });
      return;
    }

    verifyMutation.mutate({
      code: fullCode,
      email: email,
    });
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Email address is required");
      return;
    }
    resendMutation.mutate(email);
  };

  useEffect(() => {
    if (!email) {
      toast.error("Email address is required for verification");
      navigate("/register");
    }
  }, [email, navigate]);

  return (
    <div className="h-screen flex overflow-hidden">
      <BrandingPanel />

      {/* Right Panel - Form Section */}
      <div className="flex-1 bg-background overflow-y-auto scrollbar-hide h-full">
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in my-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-foreground">
                Verify your email
              </h1>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                We've sent a verification code to{" "}
                <span className="font-semibold text-foreground">{email}</span>.
                Check your inbox and enter the code below.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      One-Time Password
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enter the 6-digit code we sent you. It will expire in 10
                      minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-center block">Verification Code</Label>
                <div className="flex gap-2 sm:gap-3 justify-center">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      autoComplete="off"
                      autoFocus={index === 0}
                      className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold rounded-lg bg-background border transition-all focus:outline-none focus:ring-2 ${
                        errors.code
                          ? "border-destructive focus:border-destructive focus:ring-destructive"
                          : "border-border focus:border-primary focus:ring-primary"
                      }`}
                    />
                  ))}
                </div>
                {errors.code && (
                  <p className="text-center text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 gap-2"
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={!canResend || resendMutation.isPending}
                      className="font-semibold text-primary hover:underline transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Click to resend (${resendCooldown}s)`
                        : "Click to resend"}
                    </button>
                  </p>
                </div>

                <Link
                  to="/login"
                  className="group flex w-full items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium h-10"
                >
                  <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                  Back to login
                </Link>
              </div>
            </form>

            <div className="text-center pt-8">
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

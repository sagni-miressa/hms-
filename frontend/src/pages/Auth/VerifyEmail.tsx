import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { verifyEmail, resendVerification } from "@/services/auth.service";
import { LogoIcon } from "@/components/icons/LogoIcon";

const verifySchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

type VerifyForm = z.infer<typeof verifySchema>;

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
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    clearErrors("code");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 6 digits are entered
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

      // Focus the last filled input or the last one
      const lastFilledIndex = Math.min(newCode.length - 1, 5);
      inputRefs[lastFilledIndex].current?.focus();

      // Auto-submit if all 6 digits are pasted
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

    // Validate code
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

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error("Email address is required for verification");
      navigate("/register");
    }
  }, [email, navigate]);

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
            Verify your email
          </h1>
          <p className="text-[#897561] text-base font-normal leading-relaxed">
            We've sent a verification code to{" "}
            <span className="font-semibold text-gray-800">{email}</span>. Please
            check your inbox and enter the code below.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-4 flex flex-col gap-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Verification Code Input - 6 Boxes */}
            <label className="flex flex-col gap-2">
              <p className="text-gray-900 text-sm font-bold leading-normal pb-2 uppercase tracking-wide text-center">
                Verification Code
              </p>
              <div className="flex gap-3 justify-center">
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
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-lg bg-gray-50 border text-gray-900 transition-all focus:outline-none focus:ring-2 ${
                      errors.code
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                    }`}
                  />
                ))}
              </div>
              {errors.code && (
                <p className="mt-1 text-sm text-red-600 text-center">
                  {errors.code.message}
                </p>
              )}
            </label>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? (
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
                <span className="truncate">Verify Email</span>
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-[#897561]">
                Didn't receive the email?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || resendMutation.isPending}
                  className="font-semibold text-primary-500 hover:text-primary-600 hover:underline transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Click to resend (${resendCooldown}s)`
                    : "Click to resend"}
                </button>
              </p>
            </div>
          </form>

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

      {/* Simple Footer */}
      <div className="mt-8 text-center relative z-10">
        <p className="text-xs text-[#897561]/70">
          © 2025 RecruitHub Inc. Need help?{" "}
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

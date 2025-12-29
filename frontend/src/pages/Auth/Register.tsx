import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff} from "lucide-react";
import { register as registerUser } from "@/services/auth.service";
import { Recaptcha } from "@/components/Recaptcha";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/icons/Logo";

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
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Registration Form */}
      <div className="flex-1 bg-background order-1 lg:order-none overflow-y-auto scrollbar-hide h-full">
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in my-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                Create an Account
              </h2>
              <p className="mt-2 text-muted-foreground">
                Join to start managing your recruitment pipeline
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-foreground"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  type="text"
                  placeholder="John Doe"
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  {...register("email")}
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className={
                      errors.password ? "border-destructive pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
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
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className={
                      errors.confirmPassword
                        ? "border-destructive pr-10"
                        : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
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
              <Button
                type="submit"
                disabled={
                  registerMutation.isPending ||
                  (recaptchaSiteKey && !recaptchaToken)
                }
                className="w-full h-12 gap-2"
              >
                {registerMutation.isPending ? (
                  <>
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
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
                  className="w-full h-12 gap-2"
                >
                  <GoogleIcon />
                  <span>Google</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    try {
                      const apiUrl =
                        import.meta.env.VITE_API_URL ||
                        "http://localhost:5000/api/v1";
                      const linkedinAuthUrl = `${apiUrl}/auth/linkedin`;
                      console.log("Redirecting to:", linkedinAuthUrl);
                      window.location.href = linkedinAuthUrl;
                    } catch (error) {
                      console.error("Error initiating LinkedIn OAuth:", error);
                      toast.error("Failed to initiate LinkedIn login");
                    }
                  }}
                  className="w-full h-12 gap-2"
                >
                  <LinkedInIcon />
                  <span>LinkedIn</span>
                </Button>
              </div>

              {/* Sign In Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-semibold"
                >
                  Log In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary sticky top-0 overflow-hidden h-screen">
        {/* Background Image - Full Coverage */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Office meeting"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIoP0qZhNjBXaC8ZuN3v6NOdpt7uag80KRxEVycFtgjjcrKAyPyGYM845g8de9wg5zGirhODxGTkoNrdrSe-_b4IVBn9QkV31YSIHLsZoDD7jcfTHOf0TXFjemPMKJK7_x6xkJ5ov9koBVp47UhnTDN3LFOP12hsJwYuZ84qlrLTpOCFAuOIsy-i9MqbdYkxfSXf5OsQLp6pwjiD8wtgs2txaZkOX5XtnwaooXCwfLssWMSA5No2XjNWDX1uqrBrFAlt5OtqgamQ"
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
                The future of recruitment
                <br />
                starts here.
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/90 max-w-md">
                "RecruitHub transformed our hiring process. We found the perfect
                candidates in record time."
              </p>
            </div>
          </div>

          <p className="text-sm text-primary-foreground/60">
            © 2024 RecruitHub. All rights reserved.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl z-[5]" />
        <div className="absolute -right-16 top-1/4 w-64 h-64 rounded-full bg-primary-foreground/10 blur-2xl z-[5]" />
      </div>
    </div>
  );
};

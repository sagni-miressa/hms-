import { useState, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login, getCurrentUser } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import { Logo } from "@/components/icons/Logo";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  mfaToken: z.string().length(6, "MFA token must be 6 digits").optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const BrandingPanel = memo(() => (
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
      <Logo />

      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Start your journey to
            <br />
            success today.
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
));

BrandingPanel.displayName = "BrandingPanel";

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data, variables) => {
      if (data.requiresMFA) {
        // Navigate to MFA verification page with credentials
        navigate("/mfa-verification", {
          state: {
            email: variables.email,
            password: variables.password,
          },
        });
        toast("Please enter your MFA code", { icon: "🔐" });
        return;
      }

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
      console.error("Login error:", error);

      // Extract backend error message if available
      const backendMessage = error?.response?.data?.error?.message;
      const axiosMessage = error?.message;

      const errorMessage =
        backendMessage ||
        (axiosMessage === "Network Error"
          ? "Connection failed. Please check your internet."
          : axiosMessage) ||
        "Login failed. Please check your credentials.";

      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const handleOAuthLogin = (provider: string) => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const authUrl = `${apiUrl}/auth/${provider}`;
      console.log(`Redirecting to ${provider}:`, authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error(`Error initiating ${provider} OAuth:`, error);
      toast.error(`Failed to initiate ${provider} login`);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <BrandingPanel />

      {/* Right Panel - Login Form */}
      <div className="flex-1 bg-background overflow-y-auto scrollbar-hide h-full">
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in my-8">

            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back
              </h2>
              <p className="mt-2 text-muted-foreground">
                Sign in to access your secure workspace
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    {...register("email")}
                    className={`h-12 ${errors.email ? "border-destructive focus:ring-destructive" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`h-12 pr-12 ${errors.password ? "border-destructive focus:ring-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberDevice}
                  onCheckedChange={(checked) =>
                    setRememberDevice(checked as boolean)
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember this device for 30 days
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 gap-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* OAuth Section */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("google")}
                  className="h-12 gap-2"
                >
                  <GoogleIcon />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("linkedin")}
                  className="h-12 gap-2"
                >
                  <LinkedInIcon />
                  LinkedIn
                </Button>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-semibold"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

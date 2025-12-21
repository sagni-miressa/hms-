import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Shield } from "lucide-react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import { getCurrentUser } from "@/services/auth.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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

  console.log("login", login);
  console.log("requiresMFA", requiresMFA);
  console.log("setAuth", setAuth);
  console.log("navigate", navigate);

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
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email address"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            placeholder="••••••••"
            autoComplete="current-password"
          />

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
                <Input
                  label="MFA Code"
                  type="text"
                  {...register("mfaToken")}
                  error={errors.mfaToken?.message}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            isLoading={loginMutation.isPending}
            className="w-full"
            size="lg"
          >
            {requiresMFA ? "Verify & Sign In" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

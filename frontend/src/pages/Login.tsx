import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import { getCurrentUser } from "@/services/auth.service";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
        toast.error("MFA verification required");
        return;
      }

      // Set tokens first so getCurrentUser can use them
      const { setTokens } = useAuthStore.getState();
      setTokens(data.accessToken, data.refreshToken);

      // Get user info
      try {
        const userResponse = await getCurrentUser();
        console.log("userResponse", userResponse);
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
      const errorMessage = error?.response?.data?.error?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            {...register("email")}
            type="email"
            className={errors.email ? "input-error" : "input"}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            className={errors.password ? "input-error" : "input"}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="btn-primary w-full"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

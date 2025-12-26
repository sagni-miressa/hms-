import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { getCurrentUser } from "@/services/auth.service";
import toast from "react-hot-toast";

export const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");
    const errorMessage = searchParams.get("message");

    // Handle OAuth errors
    if (error) {
      toast.error(errorMessage || "OAuth authentication failed");
      navigate("/login");
      return;
    }

    // Check if tokens are present
    if (!accessToken || !refreshToken) {
      toast.error("Missing authentication tokens. Please try again.");
      navigate("/login");
      return;
    }

    // Set tokens in auth store
    const { setTokens } = useAuthStore.getState();
    setTokens(accessToken, refreshToken);

    // Fetch user info and complete login
    const completeLogin = async () => {
      try {
        const userResponse = await getCurrentUser();
        setAuth(userResponse.user, accessToken, refreshToken);
        toast.success("Login successful!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast.error("Failed to load user profile");
        useAuthStore.getState().logout();
        navigate("/login");
      }
    };

    completeLogin();
  }, [searchParams, navigate, setAuth]);

  // Show loading state while processing
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-recruit-bg-light">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

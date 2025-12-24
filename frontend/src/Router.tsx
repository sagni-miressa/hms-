/**
 * Router Component
 * Simple routing setup - Note: Install react-router-dom
 * npm install react-router-dom --workspace=frontend
 */

// @ts-ignore - Install react-router-dom if missing
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

// Layouts
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Pages
import { HomePage } from "@/pages/Home";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { VerifyEmailPage } from "@/pages/VerifyEmail";
import { ForgotPasswordPage } from "@/pages/ForgotPassword";
import { ResetPasswordPage } from "@/pages/ResetPassword";
import { OAuthSuccessPage } from "@/pages/OAuthSuccess";
import { JobsPage } from "@/pages/Jobs";
import { JobDetailPage } from "@/pages/JobDetail";
import { Dashboard } from "@/pages/Dashboard";
import { ApplicationsPage } from "@/pages/Applications";
import { SettingsPage } from "@/pages/Settings";
import { MFASetupPage } from "@/pages/MFASetup";
import { UsersPage } from "@/pages/Users";
import { AuditLogsPage } from "@/pages/AuditLogs";
import { BackupsPage } from "@/pages/Backups";
import { PermissionsPage } from "@/pages/Permissions";
import { NotFoundPage } from "@/pages/NotFound";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Guest Route wrapper (redirect if already authenticated)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <GuestRoute>
                <VerifyEmailPage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <ResetPasswordPage />
              </GuestRoute>
            }
          />
          <Route
            path="/oauth-success"
            element={
              <GuestRoute>
                <OAuthSuccessPage />
              </GuestRoute>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/mfa" element={<MFASetupPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/backups" element={<BackupsPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

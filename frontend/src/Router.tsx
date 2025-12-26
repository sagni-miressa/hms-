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

// Pages - Import actual existing pages
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ApplicationsPage from "@/pages/Applications";
import JobsPage from "@/pages/Jobs";
import MFAPage from "@/pages/MFA";
import UserManagementPage from "@/pages/UserManagement";
import SettingsPage from "@/pages/Settings";
import CandidatesPage from "@/pages/Candidates";
import InterviewsPage from "@/pages/Interviews";
import OffersPage from "@/pages/Offers";
import OnboardingPage from "@/pages/Onboarding";
import ReportsPage from "@/pages/Reports";
import SecurityPage from "@/pages/Security";
import CompliancePage from "@/pages/Compliance";
import ApplicantPortalPage from "@/pages/ApplicantPortal";
import NotFoundPage from "@/pages/NotFound";

// Old pages for legacy routes
import { HomePage } from "@/pages/old/Home";
import { RegisterPage } from "@/pages/old/Register";
import { VerifyEmailPage } from "@/pages/old/VerifyEmail";
import { ForgotPasswordPage } from "@/pages/old/ForgotPassword";
import { ResetPasswordPage } from "@/pages/old/ResetPassword";
import { OAuthSuccessPage } from "@/pages/old/OAuthSuccess";
import { JobDetailPage } from "@/pages/old/JobDetail";

// Admin pages
import { UserManagement } from "@/pages/admin/UserManagement";
import { AuditLogsPage as AdminAuditLogs } from "@/pages/admin/AuditLogs";
import { PermissionsManagement } from "@/pages/admin/PermissionsManagement";
import { AnalyticsDashboard } from "@/pages/admin/AnalyticsDashboard";
import { AdminSettings } from "@/pages/admin/AdminSettings";

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
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/interviews" element={<InterviewsPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/portal" element={<ApplicantPortalPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/admin" element={<AdminSettings />} />
          <Route path="/settings/mfa" element={<MFAPage />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/permissions" element={<PermissionsManagement />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

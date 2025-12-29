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
import LoginPage from "@/pages/Auth/Login";
import Dashboard from "@/pages/Dashboard";
import ApplicationsPage from "@/pages/Applications";
import JobsPage from "@/pages/Jobs";
import MFAPage from "@/pages/Auth/MFA";
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
import { HomePage } from "@/pages/public/Home";
import { RegisterPage } from "@/pages/Auth/Register";
import { MFAVerificationPage } from "@/pages/Auth/MFAVerification";
import { VerifyEmailPage } from "@/pages/Auth/VerifyEmail";
import { ForgotPasswordPage } from "@/pages/Auth/ForgotPassword";
import { ResetPasswordPage } from "@/pages/Auth/ResetPassword";
import { OAuthSuccessPage } from "@/pages/Auth/OAuthSuccess";
import { JobDetailPage } from "@/pages/public/JobDetail";
import { JobsPagePublic } from "@/pages/public/Jobs";

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
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs" element={<JobsPagePublic />} />
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
            path="/mfa-verification"
            element={
              <GuestRoute>
                <MFAVerificationPage />
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
          <Route path="/dashboard/applications" element={<ApplicationsPage />} />
          <Route path="/dashboard/candidates" element={<CandidatesPage />} />
          <Route path="/dashboard/interviews" element={<InterviewsPage />} />
          <Route path="/dashboard/offers" element={<OffersPage />} />
          <Route path="/dashboard/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/security" element={<SecurityPage />} />
          <Route path="/dashboard/compliance" element={<CompliancePage />} />
          <Route path="/dashboard/portal" element={<ApplicantPortalPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/settings/admin" element={<AdminSettings />} />
          <Route path="/dashboard/settings/mfa" element={<MFAPage />} />
          <Route path="/dashboard/users" element={<UserManagement />} />
          <Route path="/dashboard/user-management" element={<UserManagementPage />} />
          <Route path="/dashboard/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/dashboard/permissions" element={<PermissionsManagement />} />
          <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
          <Route path="/dashboard/jobs" element={<JobsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

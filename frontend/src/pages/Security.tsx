import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SecurityBadge } from "@/components/ui/SecurityBadge";
import { SecureActionButton } from "@/components/ui/SecureActionButton";
import {
  Shield,
  Smartphone,
  Key,
  Clock,
  Monitor,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Fingerprint,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface LoginEvent {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  ip: string;
  status: "success" | "failed" | "blocked";
  reason?: string;
}

const sessions: Session[] = [
  {
    id: "1",
    device: "Windows PC",
    browser: "Chrome 120",
    location: "Washington, DC",
    ip: "192.168.1.45",
    lastActive: "Just now",
    current: true,
  },
  {
    id: "2",
    device: "MacBook Pro",
    browser: "Safari 17",
    location: "New York, NY",
    ip: "192.168.1.100",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "3",
    device: "iPhone 15",
    browser: "Safari Mobile",
    location: "Chicago, IL",
    ip: "203.45.67.89",
    lastActive: "1 day ago",
    current: false,
  },
];

const loginHistory: LoginEvent[] = [
  {
    id: "1",
    timestamp: "2024-01-22 14:32:00",
    device: "Windows PC - Chrome",
    location: "Washington, DC",
    ip: "192.168.1.45",
    status: "success",
  },
  {
    id: "2",
    timestamp: "2024-01-22 08:15:00",
    device: "MacBook Pro - Safari",
    location: "New York, NY",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2024-01-21 22:45:00",
    device: "Unknown Device",
    location: "Beijing, China",
    ip: "203.45.67.89",
    status: "blocked",
    reason: "Geographic restriction",
  },
  {
    id: "4",
    timestamp: "2024-01-21 18:30:00",
    device: "iPhone 15 - Safari",
    location: "Chicago, IL",
    ip: "10.0.0.1",
    status: "success",
  },
  {
    id: "5",
    timestamp: "2024-01-20 09:00:00",
    device: "Unknown Device",
    location: "Moscow, Russia",
    ip: "91.234.56.78",
    status: "failed",
    reason: "Invalid credentials",
  },
];

const backupCodes = [
  "ABCD-1234-EFGH",
  "IJKL-5678-MNOP",
  "QRST-9012-UVWX",
  "YZAB-3456-CDEF",
  "GHIJ-7890-KLMN",
  "OPQR-2345-STUV",
  "WXYZ-6789-ABCD",
  "EFGH-0123-IJKL",
];

export default function Security() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();

  const handleTerminateSession = (sessionId: string) => {
    toast({
      title: "Session terminated",
      description: "The session has been securely terminated.",
    });
  };

  const handleTerminateAllSessions = () => {
    toast({
      title: "All sessions terminated",
      description:
        "All other sessions have been terminated. You will remain logged in.",
    });
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast({
      title: "Backup codes copied",
      description: "Store these codes in a secure location.",
    });
  };

  const handleRegenerateCodes = () => {
    toast({
      title: "Backup codes regenerated",
      description:
        "New backup codes have been generated. Previous codes are now invalid.",
    });
  };

  return (
    <AppLayout title="Security Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Security Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account security, authentication methods, and active
            sessions
          </p>
        </div>

        {/* Security Score */}
        <div className="card-elevated p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-success/10 rounded-xl">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Security Score: Excellent
                </h2>
                <p className="text-muted-foreground">
                  Your account has strong security measures in place
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SecurityBadge status="secure" label="MFA Active" />
              <SecurityBadge status="secure" label="Strong Password" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Methods */}
          <div className="card-elevated p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">
                Authentication Methods
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      Authenticator App
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Use an app like Google Authenticator
                    </p>
                  </div>
                </div>
                <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      Email Verification
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receive codes via email
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Backup</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      Hardware Security Key
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Use YubiKey or similar
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Setup
                </Button>
              </div>
            </div>
          </div>

          {/* Backup Codes */}
          <div className="card-elevated p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Backup Codes</h3>
              </div>
              <Badge variant="secondary">8 remaining</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Use these one-time codes to access your account if you lose your
              authenticator device.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className={cn(
                      "font-mono text-sm p-2 rounded bg-muted/50 text-center transition-all",
                      showBackupCodes
                        ? "text-foreground"
                        : "text-transparent bg-muted select-none"
                    )}
                  >
                    {showBackupCodes ? code : "••••-••••-••••"}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                >
                  {showBackupCodes ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {showBackupCodes ? "Hide" : "Reveal"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBackupCodes}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <SecureActionButton
                  variant="outline"
                  onConfirm={handleRegenerateCodes}
                  confirmTitle="Regenerate Backup Codes"
                  confirmDescription="This will invalidate all existing backup codes. Make sure to save the new codes."
                >
                  <RefreshCw className="h-4 w-4" />
                </SecureActionButton>
              </div>
            </div>
          </div>

          {/* Security Preferences */}
          <div className="card-elevated p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">
                Security Preferences
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-logout after 30 minutes of inactivity
                  </p>
                </div>
                <Switch
                  checked={sessionTimeout}
                  onCheckedChange={setSessionTimeout}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Login Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new logins via email
                  </p>
                </div>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">IP Restriction</p>
                  <p className="text-sm text-muted-foreground">
                    Only allow logins from approved IPs
                  </p>
                </div>
                <Switch
                  checked={ipRestriction}
                  onCheckedChange={setIpRestriction}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="card-elevated p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">Password</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">
                    Current Password
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last changed 45 days ago
                  </p>
                </div>
                <Badge className="bg-success/10 text-success border-success/20">
                  Strong
                </Badge>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new secure
                      password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" />
                    </div>
                    <Button className="w-full">Update Password</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="card-elevated p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">Active Sessions</h3>
            </div>
            <SecureActionButton
              variant="outline"
              onConfirm={handleTerminateAllSessions}
              confirmTitle="Terminate All Sessions"
              confirmDescription="This will log you out of all other devices. You will remain logged in on this device."
              isDestructive
            >
              Terminate All Other Sessions
            </SecureActionButton>
          </div>

          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {session.device}
                      </p>
                      {session.current && (
                        <Badge className="bg-success/10 text-success border-success/20">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      IP: {session.ip} • {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Login History */}
        <div className="card-elevated p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">Login History</h3>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Device</th>
                  <th>Location</th>
                  <th>IP Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((event, index) => (
                  <tr
                    key={event.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="font-mono text-sm">{event.timestamp}</td>
                    <td>{event.device}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {event.location}
                      </div>
                    </td>
                    <td className="font-mono text-sm">{event.ip}</td>
                    <td>
                      {event.status === "success" && (
                        <div className="flex items-center gap-1 text-success">
                          <CheckCircle className="h-4 w-4" />
                          <span>Success</span>
                        </div>
                      )}
                      {event.status === "failed" && (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Failed</span>
                        </div>
                      )}
                      {event.status === "blocked" && (
                        <div className="flex items-center gap-1 text-warning">
                          <Shield className="h-4 w-4" />
                          <span>Blocked</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

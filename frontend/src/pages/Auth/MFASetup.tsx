import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Fingerprint,
  Smartphone,
  Key
} from "lucide-react";
import toast from "react-hot-toast";
import { setupMFA, verifyMFA } from "@/services/mfa.service";
import {
  registerBiometric,
  getBiometricCredentials,
} from "@/services/webauthn.service";
import { getCurrentUser } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const verifySchema = z.object({
  token: z.string().length(6, "MFA token must be 6 digits"),
});

type VerifyForm = z.infer<typeof verifySchema>;

export function MFASetup() {
  const queryClient = useQueryClient();
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const setupMutation = useMutation({
    mutationFn: setupMFA,
    onSuccess: (data) => {
      setMfaSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setBackupCodes(data.backupCodes);
      toast.success(
        "MFA setup initiated. Please verify with your authenticator app."
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to setup MFA"
      );
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyMFA,
    onSuccess: () => {
      setIsVerified(true);
      toast.success("MFA enabled successfully!");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Invalid MFA token");
    },
  });

  const onSubmit = (data: VerifyForm) => {
    verifyMutation.mutate({ token: data.token });
  };

  const handleSetup = () => {
    setupMutation.mutate();
  };

  const biometricMutation = useMutation({
    mutationFn: () => registerBiometric(),
    onSuccess: () => {
      toast.success("Biometric authentication registered!");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: any) => {
      console.error("Biometric registration error:", error);
      toast.error(
        error?.response?.data?.error?.message || "Biometric registration failed"
      );
    },
  });

  const { data: biometricCredentials } = useQuery({
    queryKey: ["biometricCredentials"],
    queryFn: getBiometricCredentials,
  });

  const isBiometricActive = (biometricCredentials?.length || 0) > 0;
  const isAuthenticatorActive =
    (userData?.user.mfaEnabled && !isBiometricActive) || isVerified;

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="card-elevated p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            Security Configuration
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Add an extra layer of security to your account. When enabled, you'll
            need to provide a code from your mobile device to sign in.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={cn(
                "p-4 rounded-lg space-y-3 border transition-all",
                isAuthenticatorActive
                  ? "bg-success/5 border-success/20"
                  : "bg-primary/5 border-primary/10"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">Authenticator App</span>
                </div>
                {isAuthenticatorActive && (
                  <Badge className="bg-success/10 text-success border-success/20 py-0.5">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Get codes from apps like Google Authenticator or Microsoft
                Authenticator.
              </p>
              {!isAuthenticatorActive && !mfaSecret && (
                <Button
                  onClick={handleSetup}
                  isLoading={setupMutation.isPending}
                  className="w-full mt-2"
                >
                  Setup Authenticator
                </Button>
              )}
            </div>

            <div
              className={cn(
                "p-4 rounded-lg space-y-3 border transition-all",
                isBiometricActive
                  ? "bg-accent/5 border-accent/20"
                  : "bg-accent/5 border-accent/10"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Fingerprint className="h-5 w-5" />
                  <span className="font-medium">Biometric Auth</span>
                </div>
                {isBiometricActive && (
                  <Badge className="bg-accent/10 text-accent border-accent/20 py-0.5">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Use FaceID, TouchID, or Windows Hello for seamless, secure
                access.
              </p>
              <Button
                variant="outline"
                onClick={() => biometricMutation.mutate()}
                isLoading={biometricMutation.isPending}
                className="w-full mt-2"
              >
                {isBiometricActive
                  ? "Add Another Device"
                  : "Register Biometric"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {mfaSecret && !isVerified && (
        <div className="animate-slide-up space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: QR Code */}
            <div className="card-elevated p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <h4 className="font-medium">Scan QR Code</h4>
              </div>

              <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border border-border">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="MFA QR Code"
                    className="w-48 h-48"
                  />
                ) : (
                  <div className="w-48 h-48 bg-muted animate-pulse rounded-md" />
                )}
                <div className="w-full pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                    Manual Setup Key
                  </p>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border group">
                    <code className="text-xs font-mono break-all text-foreground">
                      {mfaSecret}
                    </code>
                    <Key className="h-3 w-3 text-muted-foreground group-hover:text-primary cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Verification */}
            <div className="card-elevated p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                <h4 className="font-medium">Verify Connection</h4>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="mfa-token">Authenticator Code</Label>
                  <Input
                    id="mfa-token"
                    {...register("token")}
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="off"
                    className={cn(
                      "h-14 text-center text-2xl tracking-[0.5em] font-mono",
                      errors.token &&
                        "border-destructive focus:ring-destructive"
                    )}
                  />
                  {errors.token && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.token.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  isLoading={verifyMutation.isPending}
                  className="w-full h-12"
                >
                  Verify & Enable
                </Button>
                <div className="flex items-center gap-2 p-3 bg-info/10 text-info text-xs rounded-lg border border-info/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>Check your authenticator app for the 6-digit code.</p>
                </div>
              </form>
            </div>
          </div>

          {/* Backup Codes */}
          {backupCodes.length > 0 && (
            <div className="card-elevated p-6 space-y-4 border-l-4 border-l-warning">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-warning" />
                  <h3 className="font-semibold text-foreground">
                    Backup Recovery Codes
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Print Codes
                </Button>
              </div>

              <div className="p-4 bg-warning/5 border border-warning/10 rounded-lg">
                <div className="flex gap-3 text-warning mb-4">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Store these codes securely. They provide emergency access if
                    you lose your device.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="p-2 bg-background border border-border rounded font-mono text-center text-sm shadow-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isVerified && (
        <div className="card-elevated p-8 text-center animate-fade-in">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            MFA Setup Complete
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Your identity is now protected with multi-factor authentication.
            You'll be prompted for a code during your next sign-in.
          </p>
          <Button onClick={() => setIsVerified(false)} variant="outline">
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

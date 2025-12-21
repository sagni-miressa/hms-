import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { setupMFA, verifyMFA } from "@/services/mfa.service";
import { getCurrentUser } from "@/services/auth.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

const verifySchema = z.object({
  token: z.string().length(6, "MFA token must be 6 digits"),
});

type VerifyForm = z.infer<typeof verifySchema>;

export const MFASetupPage = () => {
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

  if (userData?.user.mfaEnabled && !mfaSecret) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card
          title="Multi-Factor Authentication"
          description="MFA is already enabled for your account."
        >
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">
                Your account is protected with MFA
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Multi-Factor Authentication
        </h1>
        <p className="mt-2 text-gray-600">
          Add an extra layer of security to your account with two-factor
          authentication.
        </p>
      </div>

      {!mfaSecret && !isVerified && (
        <Card
          title="Setup MFA"
          description="Scan the QR code with your authenticator app to enable MFA."
        >
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">Why enable MFA?</h3>
                <p className="mt-1 text-sm text-blue-700">
                  MFA adds an additional security layer by requiring a code from
                  your authenticator app in addition to your password when
                  logging in.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSetup}
              isLoading={setupMutation.isPending}
              className="w-full"
            >
              Start MFA Setup
            </Button>
          </div>
        </Card>
      )}

      {mfaSecret && !isVerified && (
        <>
          <Card title="Step 1: Scan QR Code">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={qrCodeUrl}
                    alt="MFA QR Code"
                    className="w-64 h-64"
                  />
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Manual Entry (if QR code doesn't work):
                </p>
                <code className="text-sm text-gray-900 font-mono break-all">
                  {mfaSecret}
                </code>
              </div>
            </div>
          </Card>

          <Card title="Step 2: Verify Setup">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Enter 6-digit code from your authenticator app"
                {...register("token")}
                error={errors.token?.message}
                placeholder="000000"
                maxLength={6}
                autoComplete="off"
              />
              <Button
                type="submit"
                isLoading={verifyMutation.isPending}
                className="w-full"
              >
                Verify and Enable MFA
              </Button>
            </form>
          </Card>

          {backupCodes.length > 0 && (
            <Card
              title="Backup Codes"
              description="Save these codes in a safe place. You can use them to access your account if you lose your authenticator device."
            >
              <div className="space-y-4">
                <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    These codes are only shown once. Make sure to save them
                    securely.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg font-mono text-sm text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {isVerified && (
        <Card>
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              MFA Enabled Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your account is now protected with multi-factor authentication.
            </p>
            <Badge variant="success" size="md">
              MFA Active
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
};

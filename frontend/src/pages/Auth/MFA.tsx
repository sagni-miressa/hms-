import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Shield,
  Smartphone,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function MFA() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every((digit) => digit) && newCode.join("").length === 6) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("");
      while (newCode.length < 6) newCode.push("");
      setCode(newCode);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (verificationCode: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (verificationCode === "123456") {
      toast({
        title: "Verification successful",
        description: "Welcome to RecruitHub. Redirecting to dashboard...",
      });
      navigate("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please check your authenticator app and try again.",
      });
      setCode(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "New code sent",
      description: "A new verification code has been sent to your device.",
    });
    setIsResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Two-Factor Authentication
          </h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="card-elevated p-8 space-y-6">
          <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
            <Smartphone className="h-5 w-5 text-accent" />
            <span className="text-sm text-muted-foreground">
              Use code:{" "}
              <span className="font-mono font-bold text-foreground">
                123456
              </span>{" "}
              for demo
            </span>
          </div>

          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={cn(
                  "w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all",
                  "bg-background text-foreground",
                  "focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none",
                  digit ? "border-accent" : "border-border",
                  isLoading && "opacity-50"
                )}
              />
            ))}
          </div>

          <Button
            onClick={() => handleSubmit(code.join(""))}
            className="w-full h-12"
            disabled={isLoading || code.some((d) => !d)}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify & Continue
              </>
            )}
          </Button>

          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-muted-foreground"
            >
              {isResending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Resend code
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Having trouble?{" "}
            <button
              onClick={() => navigate("/backup-codes")}
              className="text-accent hover:underline"
            >
              Use backup code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

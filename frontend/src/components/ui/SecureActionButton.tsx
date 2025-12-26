import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

interface SecureActionButtonProps {
  children: React.ReactNode;
  onConfirm: () => void;
  confirmTitle?: string;
  confirmDescription?: string;
  variant?: "default" | "destructive" | "outline";
  requiresConfirmation?: boolean;
  isDestructive?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SecureActionButton({
  children,
  onConfirm,
  confirmTitle = "Confirm Action",
  confirmDescription = "Are you sure you want to proceed with this action?",
  variant = "default",
  requiresConfirmation = true,
  isDestructive = false,
  className,
  disabled,
}: SecureActionButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (requiresConfirmation) {
      setShowConfirm(true);
    } else {
      onConfirm();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant={isDestructive ? "destructive" : variant}
        onClick={handleClick}
        className={cn("gap-2", className)}
        disabled={disabled}
      >
        {isDestructive ? <AlertTriangle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        {children}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isDestructive ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <Lock className="h-5 w-5 text-accent" />
              )}
              {confirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(isDestructive && "bg-destructive hover:bg-destructive/90")}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { memo } from "react";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/Logo";
import { forgotPassword } from "@/services/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const BrandingPanel = memo(() => (
  <div className="hidden lg:flex lg:w-1/2 bg-primary sticky top-0 overflow-hidden h-screen">
    {/* Background Image - Full Coverage */}
    <div className="absolute inset-0 z-0">
      <img
        alt="Office collaboration"
        className="w-full h-full object-cover"
        src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
      />
    </div>

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/90 to-primary/80 z-10" />

    {/* Content Layer */}
    <div className="relative z-20 flex flex-col justify-between p-12 text-primary-foreground w-full">
      <Logo />

      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Recover your access
            <br />
            with ease.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90 max-w-md">
            "Don't worry, it happens to the best of us. We'll help you get back
            into your account in no time."
          </p>
        </div>
      </div>

      <p className="text-sm text-primary-foreground/60">
        © 2025 RecruitHub. All rights reserved.
      </p>
    </div>

    {/* Decorative Elements */}
    <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl z-[5]" />
    <div className="absolute -right-16 top-1/4 w-64 h-64 rounded-full bg-primary-foreground/10 blur-2xl z-[5]" />
  </div>
));

BrandingPanel.displayName = "BrandingPanel";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      toast.success(
        "If an account exists with this email, reset instructions have been sent."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to send reset instructions. Please try again.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data.email);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <BrandingPanel />

      {/* Right Panel - Form Section */}
      <div className="flex-1 bg-background overflow-y-auto scrollbar-hide h-full">
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in my-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-foreground">
                Forgot password?
              </h1>
              <p className="mt-2 text-muted-foreground">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      {...register("email")}
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="email"
                      className={`h-12 pr-12 ${
                        errors.email
                          ? "border-destructive focus:ring-destructive"
                          : ""
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors pointer-events-none">
                      <Mail className="size-5" />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 gap-2"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Reset link
                    </>
                  )}
                </Button>

                <Link
                  to="/login"
                  className="group flex w-full items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium h-10"
                >
                  <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                  Back to login
                </Link>
              </div>
            </form>

            <div className="text-center pt-8">
              <p className="text-xs text-muted-foreground/60">
                © 2025 RecruitHub. Having trouble?{" "}
                <a
                  href="#"
                  className="underline hover:text-primary transition-colors"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

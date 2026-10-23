import { LoginForm } from "@/components/mycomponents/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg p-px">
        {/* Animated border */}
        <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,var(--primary)_90deg,transparent_180deg,var(--primary)_270deg,transparent_360deg)]" />

        {/* Card */}
        <div className="relative rounded-lg bg-background p-6 shadow-md">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>

            <p className="text-muted-foreground">Sign in to your account.</p>
          </div>

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}

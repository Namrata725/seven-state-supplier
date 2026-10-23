import { RegisterForm } from "@/components/mycomponents/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      {/* Animated border wrapper */}
      <div className="relative w-full max-w-md overflow-hidden rounded-lg p-px">
        {/* Moving gradient */}
        <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,var(--primary)_90deg,transparent_180deg,var(--primary)_220deg,transparent_360deg)]" />

        {/* Card */}
        <div className="relative rounded-lg bg-background p-6 shadow-md">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-primary">
              Create an Account
            </h1>

            <p className="text-muted-foreground">
              Register to create your account.
            </p>
          </div>

          <div className="mt-6">
            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}

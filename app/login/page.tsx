import LoginForm from "@/src/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <LoginForm />
    </main>
  );
}

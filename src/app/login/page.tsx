import { redirect } from "next/navigation";
import { getAuthStatus } from "@/lib/auth/user";
import { LoginForm } from "./login-form";
import { getDictionary } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const status = await getAuthStatus();
  // No account yet → send to first-run setup.
  if (!status.hasUser || !status.isSetup) redirect("/setup");
  const t = await getDictionary();

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="absolute end-4 top-4 flex items-center gap-1">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo className="size-14" />
          <h1 className="text-center text-2xl font-extrabold text-fg">
            {t.appName}
          </h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

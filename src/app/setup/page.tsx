import { redirect } from "next/navigation";
import { getAuthStatus } from "@/lib/auth/user";
import { generateTotpSecret, totpKeyUri, qrDataUrl } from "@/lib/auth/totp";
import { SetupForm } from "./setup-form";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

// First-run only. Once the account is set up, this route is closed.
export default async function SetupPage() {
  const status = await getAuthStatus();
  if (status.isSetup) redirect("/login");

  const secret = generateTotpSecret();
  const uri = totpKeyUri("account", secret);
  const qr = await qrDataUrl(uri);

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="absolute end-4 top-4 flex items-center gap-1">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <SetupForm secret={secret} qr={qr} defaultEmail={status.email ?? ""} />
    </main>
  );
}

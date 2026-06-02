"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { loginStep1, loginStep2 } from "@/app/actions/auth";

export function LoginForm() {
  const { t } = useI18n();
  const [step, setStep] = useState<"password" | "totp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginStep1(email, password);
      if (res.ok) {
        setStep("totp");
        setToken("");
      } else {
        setError(res.error);
      }
    });
  }

  function submitToken(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (token.replace(/\D/g, "").length !== 6) {
      setError(t.login.sixDigit);
      return;
    }
    startTransition(async () => {
      const res = await loginStep2(token);
      if (res.ok) {
        window.location.assign("/");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-7 shadow-sm">
      {step === "password" ? (
        <form onSubmit={submitPassword} className="space-y-3">
          <h2 className="text-lg font-bold text-fg">{t.login.title}</h2>
          <Input
            type="email"
            dir="ltr"
            placeholder={t.login.email}
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            type="password"
            placeholder={t.login.password}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" loading={pending} className="w-full">
            {t.login.continue}
          </Button>
        </form>
      ) : (
        <form onSubmit={submitToken} className="space-y-3">
          <h2 className="text-lg font-bold text-fg">
            {t.login.totpTitle}
          </h2>
          <p className="text-sm text-muted">{t.login.totpHint}</p>
          <Input
            inputMode="numeric"
            dir="ltr"
            placeholder="000000"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
            className="text-center text-xl tracking-[0.5em]"
            required
            autoFocus
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" loading={pending} className="w-full">
            {t.login.enter}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("password");
              setError(null);
            }}
            className="w-full text-center text-xs font-medium text-muted hover:text-strong"
          >
            {t.login.backToPassword}
          </button>
        </form>
      )}
    </div>
  );
}

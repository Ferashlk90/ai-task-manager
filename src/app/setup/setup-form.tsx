"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { completeSetup } from "@/app/actions/auth";

export function SetupForm({
  secret,
  qr,
  defaultEmail,
}: {
  secret: string;
  qr: string;
  defaultEmail: string;
}) {
  const { t } = useI18n();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t.setup.passwordMin);
      return;
    }
    if (password !== confirm) {
      setError(t.setup.passwordMismatch);
      return;
    }
    if (token.replace(/\D/g, "").length !== 6) {
      setError(t.setup.sixDigit);
      return;
    }
    startTransition(async () => {
      const res = await completeSetup({ email, password, secret, token });
      if (res.ok) {
        window.location.assign("/");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-7 shadow-sm">
      <h1 className="text-xl font-bold text-fg">{t.setup.title}</h1>
      <p className="mt-1 text-sm text-muted">{t.setup.subtitle}</p>

      <div className="mt-6 rounded-2xl border border-line bg-surface-muted p-4">
        <p className="text-sm font-semibold text-strong">
          {t.setup.step1Title}
        </p>
        <p className="mt-1 text-xs text-muted">{t.setup.step1Hint}</p>
        <div className="mt-3 flex items-center gap-4">
          <Image
            src={qr}
            alt={t.setup.qrAlt}
            width={110}
            height={110}
            className="rounded-lg border border-line bg-surface p-1"
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">{t.setup.manualKey}</p>
            <code className="mt-1 block truncate rounded-md bg-surface px-2 py-1 text-[11px] text-strong ring-1 ring-line">
              {secret}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(secret);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="mt-1.5 text-xs font-medium text-muted hover:text-fg"
            >
              {copied ? t.setup.copied : t.setup.copyKey}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <p className="text-sm font-semibold text-strong">
          {t.setup.step2Title}
        </p>
        <Input
          type="email"
          dir="ltr"
          placeholder={t.login.email}
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={t.setup.passwordPlaceholder}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={t.setup.confirmPlaceholder}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <p className="pt-1 text-sm font-semibold text-strong">
          {t.setup.step3Title}
        </p>
        <Input
          inputMode="numeric"
          dir="ltr"
          placeholder="000000"
          maxLength={6}
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
          className="text-center text-lg tracking-[0.4em]"
          required
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" loading={pending} className="w-full">
          {t.setup.finish}
        </Button>
      </form>
    </div>
  );
}

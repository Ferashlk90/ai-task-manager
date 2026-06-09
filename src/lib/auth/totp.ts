import "server-only";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { TOTP_ISSUER } from "@/lib/constants";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpKeyUri(email: string, secret: string): string {
  return generateURI({ issuer: TOTP_ISSUER, label: email, secret });
}

// Returns whether the code is valid and, when valid, the RFC 6238 time-step it
// matched (`step`). Callers persist that step and reject any later code at or
// before it, which is what stops a code being replayed within its window.
export async function verifyTotp(
  token: string,
  secret: string,
): Promise<{ valid: boolean; step: number | null }> {
  try {
    // ±30s tolerance to allow for clock drift between devices.
    const result = await verify({
      secret,
      token: token.trim(),
      epochTolerance: 30,
    });
    // `timeStep` is present on the TOTP result variant (we only ever verify
    // TOTP); the `in` narrow keeps TS happy against the TOTP|HOTP union.
    return result.valid && "timeStep" in result
      ? { valid: true, step: result.timeStep }
      : { valid: result.valid, step: null };
  } catch {
    return { valid: false, step: null };
  }
}

export function qrDataUrl(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri, { margin: 1, width: 220 });
}

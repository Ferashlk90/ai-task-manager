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

export async function verifyTotp(
  token: string,
  secret: string,
): Promise<boolean> {
  try {
    // ±30s tolerance to allow for clock drift between devices.
    const result = await verify({
      secret,
      token: token.trim(),
      epochTolerance: 30,
    });
    return result.valid;
  } catch {
    return false;
  }
}

export function qrDataUrl(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri, { margin: 1, width: 220 });
}

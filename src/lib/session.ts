import crypto from "crypto";

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string | null;
  exp: number;
}

const SECRET = process.env.SESSION_SECRET || "default-secret-key-at-least-32-chars-long";

export function createSessionToken(payload: Omit<SessionPayload, "exp">, durationSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + durationSeconds;
  const data: SessionPayload = { ...payload, exp };
  const encodedData = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(encodedData)
    .digest("base64url");

  return `${encodedData}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encodedData, signature] = token.split(".");
    if (!encodedData || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(encodedData)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "utf-8"),
        Buffer.from(expectedSignature, "utf-8")
      )
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(encodedData, "base64url").toString("utf-8")
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

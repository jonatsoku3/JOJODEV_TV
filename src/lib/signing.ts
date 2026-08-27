import { createHmac, timingSafeEqual } from "crypto";

function secret() {
  return process.env.MEDIA_SIGNING_SECRET || "jojodevtv-local-dev-key";
}

export type MediaGrant = {
  url: string;
  ua?: string;
  referrer?: string;
  exp: number;
  sig: string;
};

function payload(input: {
  url: string;
  ua?: string;
  referrer?: string;
  exp: number;
}) {
  return `${input.exp}\n${input.url}\n${input.ua ?? ""}\n${input.referrer ?? ""}`;
}

export function signMedia(input: {
  url: string;
  ua?: string;
  referrer?: string;
  exp?: number;
}): MediaGrant {
  const exp = input.exp ?? Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  const sig = createHmac("sha256", secret())
    .update(payload({ ...input, exp }))
    .digest("base64url");
  return {
    url: input.url,
    ua: input.ua,
    referrer: input.referrer,
    exp,
    sig,
  };
}

export function verifyMedia(input: {
  url: string;
  ua?: string;
  referrer?: string;
  exp: string | number;
  sig: string;
}) {
  const exp = Number(input.exp);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000) - 45) {
    return false;
  }
  const expected = signMedia({
    url: input.url,
    ua: input.ua,
    referrer: input.referrer,
    exp,
  });
  try {
    const a = Buffer.from(expected.sig);
    const b = Buffer.from(input.sig);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function logoPath(url: string) {
  const sig = createHmac("sha256", secret()).update(`logo\n${url}`).digest("base64url");
  const q = new URLSearchParams({ u: url, s: sig });
  return `/api/logo?${q.toString()}`;
}

export function verifyLogo(url: string, sig: string) {
  const expected = createHmac("sha256", secret()).update(`logo\n${url}`).digest("base64url");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function mediaPath(input: {
  url: string;
  ua?: string;
  referrer?: string;
}) {
  const signed = signMedia(input);
  const q = new URLSearchParams();
  q.set("u", signed.url);
  q.set("exp", String(signed.exp));
  q.set("sig", signed.sig);
  if (input.ua) q.set("a", input.ua);
  if (input.referrer) q.set("r", input.referrer);
  return `/api/media?${q.toString()}`;
}

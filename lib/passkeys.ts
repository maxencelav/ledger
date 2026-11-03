import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** Passkey fields the management UI needs, narrowed for the client boundary. */
export type PasskeySummary = {
  id: string;
  name: string | null;
  backedUp: boolean;
  /** ISO timestamp, for the <time> element's machine-readable value. */
  createdAt: string | null;
  /** Pre-formatted for display: see {@link formatCreatedAt}. */
  createdAtLabel: string | null;
  aaguid: string | null;
};

/**
 * Formats the date on the server, with locale and time zone pinned.
 *
 * Letting the client call toLocaleDateString() desynchronises hydration: Node
 * and the browser rarely agree on a default locale (03/11/2026 vs 11/3/2026),
 * and even with a fixed locale their time zones can disagree on which day a
 * near-midnight timestamp falls in.
 *
 * The month is spelled out so the result is unambiguous to any reader, which
 * a numeric day/month order never is.
 */
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatCreatedAt(date: Date | null | undefined): string | null {
  return date ? DATE_FORMAT.format(date) : null;
}

/**
 * Lists the signed-in user's passkeys. Reads the session cookie, so callers
 * must render it behind a `<Suspense>` boundary.
 */
export async function getUserPasskeys(): Promise<PasskeySummary[]> {
  "use cache: private";

  const passkeys = await auth.api.listPasskeys({ headers: await headers() });

  return passkeys.map((passkey) => ({
    id: passkey.id,
    name: passkey.name ?? null,
    backedUp: passkey.backedUp,
    // Serialized here so the value crosses to the Client Component as a
    // plain string rather than relying on Date serialization.
    createdAt: passkey.createdAt ? passkey.createdAt.toISOString() : null,
    createdAtLabel: formatCreatedAt(passkey.createdAt),
    aaguid: passkey.aaguid ?? null,
  }));
}

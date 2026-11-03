"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, ErrorText } from "@/components/ui";

/** Human-readable labels for the scopes this server issues. */
const SCOPE_LABELS: Record<string, string> = {
  openid: "Confirm who you are",
  profile: "Read your name and profile picture",
  email: "Read your email address",
  offline_access: "Stay connected when you're away",
};

export function ConsentForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const clientId = searchParams.get("client_id") ?? "An application";
  const scopes = (searchParams.get("scope") ?? "").split(" ").filter(Boolean);

  // The claims parameter is a JSON object, and a malformed one should not take
  // the page down, so it is parsed defensively and only used for display.
  const claims = parseUserInfoClaims(searchParams.get("claims"));

  async function decide(accept: boolean) {
    setError(undefined);
    setPending(true);

    const response = await fetch("/api/auth/oauth2/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accept,
        oauth_query: searchParams.toString(),
      }),
    });

    if (!response.ok) {
      setPending(false);
      setError(
        accept
          ? "Could not complete authorization. Try again from the application."
          : "Could not cancel cleanly. Close this window to deny access.",
      );
      return;
    }

    const result: { redirect?: boolean; url?: string } = await response.json();
    if (result.url) {
      // A full navigation, since the destination is the OAuth client.
      window.location.href = result.url;
      return;
    }

    setPending(false);
    setError("Authorization server did not return a redirect.");
  }

  return (
    <Card
      title="Authorize access"
      subtitle={`${clientId} wants to access your Ledger account.`}
    >
      <div className="flex flex-col gap-5">
        <ErrorText>{error}</ErrorText>

        {scopes.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              It will be able to
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {scopes.map((scope) => (
                <li
                  key={scope}
                  className="text-sm text-zinc-800 dark:text-zinc-200"
                >
                  {SCOPE_LABELS[scope] ?? scope}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {claims.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Profile details requested
            </p>
            <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
              {claims.join(", ")}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button onClick={() => decide(true)} disabled={pending}>
            {pending ? "Authorizing…" : "Allow"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => decide(false)}
            disabled={pending}
          >
            Deny
          </Button>
        </div>
      </div>
    </Card>
  );
}

function parseUserInfoClaims(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "userinfo" in parsed &&
      typeof parsed.userinfo === "object" &&
      parsed.userinfo !== null
    ) {
      return Object.keys(parsed.userinfo);
    }
  } catch {
    // A claims value we can't read is shown as nothing rather than breaking
    // the consent screen; the provider still enforces what it parsed.
  }
  return [];
}

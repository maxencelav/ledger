"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatorName } from "@better-auth/passkey";
import { authClient } from "@/lib/auth-client";
import type { PasskeySummary } from "@/lib/passkeys";
import { Button, ErrorText } from "@/components/ui";

export function PasskeyManager({
  passkeys,
}: {
  passkeys: PasskeySummary[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  const busy = pending || isRefreshing;

  /** Re-runs the server read so the list reflects the mutation. */
  function refresh() {
    startTransition(() => router.refresh());
  }

  async function onAdd() {
    setError(undefined);
    setPending(true);

    // Resolves undefined on success; an error object means registration failed
    // or the user dismissed the browser prompt.
    const result = await authClient.passkey.addPasskey({
      name: defaultPasskeyName(),
    });

    setPending(false);
    if (result?.error) {
      setError(result.error.message ?? "Could not add a passkey.");
      return;
    }
    refresh();
  }

  async function onDelete(id: string) {
    setError(undefined);
    setPending(true);

    const { error } = await authClient.passkey.deletePasskey({ id });

    setPending(false);
    if (error) {
      setError(error.message ?? "Could not remove that passkey.");
      return;
    }
    refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">
            Passkeys
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in with Touch ID, Face ID, or a security key.
          </p>
        </div>
        <div className="w-32 shrink-0">
          <Button onClick={onAdd} disabled={busy}>
            {busy ? "Working…" : "Add passkey"}
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <ErrorText>{error}</ErrorText>

        {passkeys.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-3 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No passkeys yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {passkeys.map((passkey) => (
              <li
                key={passkey.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-black dark:text-zinc-50">
                    {passkey.name ?? "Unnamed passkey"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {[
                      getAuthenticatorName(passkey.aaguid),
                      passkey.backedUp ? "synced" : "this device only",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    {passkey.createdAtLabel ? (
                      <>
                        {" · "}
                        {/* Already formatted server-side; formatting it here
                            would not survive hydration. */}
                        <time dateTime={passkey.createdAt ?? undefined}>
                          {passkey.createdAtLabel}
                        </time>
                      </>
                    ) : null}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(passkey.id)}
                  disabled={busy}
                  className="shrink-0 text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Labels the passkey with the platform it was created on, as a starting point. */
function defaultPasskeyName() {
  const platform =
    typeof navigator === "undefined" ? "" : navigator.platform || "";
  return platform ? `Passkey on ${platform}` : "Passkey";
}

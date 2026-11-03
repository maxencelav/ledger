"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, Card, ErrorText, Field } from "@/components/ui";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  // The OAuth/MCP flow sends the user here with its own query string; sending
  // them back to /oauth2/authorize resumes the authorization after login.
  const redirectTo = searchParams.get("redirect_uri")
    ? `/api/auth/oauth2/authorize?${searchParams.toString()}`
    : "/dashboard";

  // Guards against the conditional-UI request still being in flight when the
  // component unmounts, which would surface as an unhandled abort.
  const autoFillStarted = useRef(false);

  useEffect(() => {
    if (autoFillStarted.current) return;
    autoFillStarted.current = true;

    async function startConditionalUi() {
      if (
        typeof PublicKeyCredential === "undefined" ||
        !PublicKeyCredential.isConditionalMediationAvailable ||
        !(await PublicKeyCredential.isConditionalMediationAvailable())
      ) {
        return;
      }

      // Resolves only once the user picks a passkey from the browser's own
      // autofill dropdown, so it is intentionally not awaited for UI state.
      await authClient.signIn.passkey({
        autoFill: true,
        fetchOptions: {
          onSuccess: () => router.push(redirectTo),
        },
      });
    }

    void startConditionalUi();
  }, [router, redirectTo]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    setPending(false);
    if (error) {
      setError(error.message ?? "Sign in failed.");
      return;
    }

    // Re-run the server reads so the new session is visible on arrival.
    router.refresh();
    router.push(redirectTo);
  }

  async function onPasskey() {
    setError(undefined);
    setPending(true);

    const { error } = await authClient.signIn.passkey();

    setPending(false);
    if (error) {
      setError(error.message ?? "Passkey sign in failed.");
      return;
    }
    router.push(redirectTo);
  }

  return (
    <>
      <Card
        title="Sign in"
        subtitle="Use your password or a passkey."
        footer={
          <>
            No account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-black underline dark:text-zinc-50"
            >
              Create one
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ErrorText>{error}</ErrorText>

          {/* The trailing `webauthn` token is what enables the browser to
              offer saved passkeys inside the normal autofill dropdown. */}
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="username webauthn"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="current-password webauthn"
          />

          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            or
          </span>
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <Button variant="secondary" onClick={onPasskey} disabled={pending}>
          Sign in with a passkey
        </Button>
      </Card>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        // Clears the private session cache so the next render re-reads it.
        router.refresh();
        router.push("/sign-in");
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

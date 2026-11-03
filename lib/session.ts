import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** The narrow user shape safe to hand to Client Components. */
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

/**
 * Reads the session and resolves the current user.
 *
 * `use cache: private` is what makes this viable with Cache Components: a
 * plain `use cache` cannot call `cookies()`, and the cookie can't be lifted
 * out and passed in because Better Auth reads it inside its own code and
 * validates it against the current time. A private scope reads the request
 * directly and keeps the result in the browser only, never on the server.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  "use cache: private";

  const session = await auth.api.getSession({ headers: await headers() });

  // Throws to interrupt rendering rather than returning, so it isn't cached.
  if (!session) {
    redirect("/sign-in");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };
}

/** Same read, but returns null instead of redirecting. For optional UI. */
export async function getOptionalUser(): Promise<CurrentUser | null> {
  "use cache: private";

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };
}

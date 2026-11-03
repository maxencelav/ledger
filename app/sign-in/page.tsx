import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/session";
import { SignInForm } from "./sign-in-form";
import { CardSkeleton } from "@/components/ui";

export default function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      {/* Reads the session and the URL, so it streams in behind the boundary. */}
      <Suspense fallback={<CardSkeleton />}>
        <SignInGate searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/**
 * Sends an already-signed-in visitor away before the form is ever rendered,
 * so there is no flash of a sign-in box they don't need.
 */
async function SignInGate({
  searchParams,
}: {
  searchParams: PageProps<"/sign-in">["searchParams"];
}) {
  const params = await searchParams;
  const user = await getOptionalUser();

  if (user) {
    redirect(destinationFor(params));
  }

  return <SignInForm />;
}

/**
 * An OAuth client sends the user here mid-authorization. Dropping them on the
 * dashboard would abandon that flow, so hand them back to the authorize
 * endpoint with the original query intact.
 */
function destinationFor(
  params: Awaited<PageProps<"/sign-in">["searchParams"]>,
): string {
  if (!params.redirect_uri && !params.client_id) {
    return "/dashboard";
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    }
  }
  return `/api/auth/oauth2/authorize?${query.toString()}`;
}

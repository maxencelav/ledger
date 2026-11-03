import { Suspense } from "react";
import Link from "next/link";
import { getOptionalUser } from "@/lib/session";

const PRIMARY =
  "flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] sm:w-[158px]";
const SECONDARY =
  "flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:w-[158px]";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <main className="flex w-full max-w-sm flex-col items-center gap-10">
        {/* Static: prerendered into the shell and shown immediately. */}
        <h1 className="text-5xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Ledger
        </h1>

        {/* Depends on the session, so it streams in behind the boundary. */}
        <Suspense fallback={<ActionsSkeleton />}>
          <Actions />
        </Suspense>
      </main>
    </div>
  );
}

async function Actions() {
  const user = await getOptionalUser();

  if (user) {
    return (
      <Row>
        <Link className={PRIMARY} href="/dashboard">
          Dashboard
        </Link>
      </Row>
    );
  }

  return (
    <Row>
      <Link className={PRIMARY} href="/sign-in">
        Sign in
      </Link>
      <Link className={SECONDARY} href="/sign-up">
        Sign up
      </Link>
    </Row>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-3 text-base font-medium sm:flex-row sm:justify-center">
      {children}
    </div>
  );
}

/**
 * Sized like the real buttons so the page doesn't shift when they arrive.
 * It stays neutral on purpose: rendering "Sign in" here would briefly show a
 * signed-in visitor the wrong action.
 */
function ActionsSkeleton() {
  return (
    <Row>
      <div className="h-12 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-900 sm:w-[158px]" />
      <div className="h-12 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-900 sm:w-[158px]" />
    </Row>
  );
}

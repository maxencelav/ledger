import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import { getUserPasskeys } from "@/lib/passkeys";
import { PasskeyManager } from "./passkey-manager";
import { SignOutButton } from "./sign-out-button";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-xl">
        {/* Both sections read the session at request time, so each streams in
            behind its own boundary rather than blocking the page. */}
        <Suspense fallback={<CardSkeleton lines={2} />}>
          <Account />
        </Suspense>

        <div className="mt-8">
          <Suspense fallback={<CardSkeleton lines={3} />}>
            <Passkeys />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function Account() {
  const user = await getCurrentUser();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {user.name}
          </h1>
          <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
        <div className="w-28 shrink-0">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

async function Passkeys() {
  const passkeys = await getUserPasskeys();
  return <PasskeyManager passkeys={passkeys} />;
}

function CardSkeleton({ lines }: { lines: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      {Array.from({ length: lines - 1 }).map((_, index) => (
        <div
          key={index}
          className="mt-2 h-4 w-56 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900"
        />
      ))}
    </div>
  );
}

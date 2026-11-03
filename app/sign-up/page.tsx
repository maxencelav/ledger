import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/session";
import { SignUpForm } from "./sign-up-form";
import { CardSkeleton } from "@/components/ui";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <Suspense fallback={<CardSkeleton />}>
        <SignUpGate />
      </Suspense>
    </div>
  );
}

/** Someone already signed in has no use for a sign-up form. */
async function SignUpGate() {
  const user = await getOptionalUser();
  if (user) {
    redirect("/dashboard");
  }
  return <SignUpForm />;
}

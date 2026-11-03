import type { ComponentProps, ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
      {footer ? (
        <div className="mt-6 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-200">
        {label}
      </span>
      <input
        {...props}
        className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-300"
      />
    </label>
  );
}

export function Button({
  variant = "primary",
  ...props
}: { variant?: "primary" | "secondary" } & ComponentProps<"button">) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
      : "border border-zinc-300 bg-white text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800";
  return <button {...props} className={`${base} ${styles}`} />;
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
    >
      {children}
    </p>
  );
}

/** Placeholder sized like {@link Card}, to hold the layout while it streams. */
export function CardSkeleton() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="h-6 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
      <div className="mt-8 flex flex-col gap-4">
        <div className="h-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-10 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-28 text-center sm:px-6">
      <p className="font-mono text-7xl font-bold text-accent">404</p>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-muted">
        Node not found
      </p>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">This rack is empty.</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        The listing you are looking for does not exist, or it has been decommissioned and
        removed from the floor.
      </p>
      <Link
        href="/browse"
        className="mt-8 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accentink transition-opacity hover:opacity-90"
      >
        Back to browse
      </Link>
    </div>
  );
}

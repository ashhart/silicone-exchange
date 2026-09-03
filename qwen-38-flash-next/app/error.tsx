"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid-bg mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        node unreachable
      </h1>
      <p className="mt-4 max-w-md border border-bad/40 bg-panel px-4 py-3 text-left text-xs text-bad">
        {error.message.length > 0 ? error.message : "Unknown fault."}
        {error.digest ? (
          <span className="block text-[10px] text-faint">
            digest {error.digest}
          </span>
        ) : null}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-accent bg-accent px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-bg uppercase hover:bg-transparent hover:text-accent"
      >
        Retry connection
      </button>
    </div>
  );
}

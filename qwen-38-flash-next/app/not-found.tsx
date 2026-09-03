import Link from "next/link";
import { Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid-bg mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <Logo className="h-10 w-10 text-accent" />
      <p className="mt-8 text-[11px] tracking-[0.3em] text-faint uppercase">
        signal lost — route not found
      </p>
      <h1 className="mt-4 font-display text-7xl font-semibold tracking-tight text-ink tabular-nums md:text-8xl">
        404
      </h1>
      <div className="mt-6 w-full max-w-md border border-hairline bg-panel p-4 text-left text-xs leading-relaxed">
        <p className="text-faint">
          <span className="text-accent">$</span> connect{" "}
          <span className="text-ink">/this/node</span>
        </p>
        <p className="mt-1 text-bad">
          ssh_exchange_identification: no such listing on the exchange
        </p>
        <p className="mt-1 text-dim">
          the rack you requested is not in any region{""}
          <span className="cursor-blink text-accent">▊</span>
        </p>
      </div>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="border border-hairline px-4 py-2 text-[11px] tracking-[0.14em] text-dim uppercase hover:border-accent hover:text-accent"
        >
          Home
        </Link>
        <Link
          href="/browse"
          className="border border-accent bg-accent px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-bg uppercase hover:bg-transparent hover:text-accent"
        >
          Open the board
        </Link>
      </div>
    </div>
  );
}

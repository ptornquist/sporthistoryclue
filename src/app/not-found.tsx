import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">404</p>
      <h1 className="mt-3 font-serif text-4xl text-paper">Den här sidan finns inte</h1>
      <p className="mt-3 text-paper/65">Numret matchar inget i arkivet.</p>
      <Link href="/" className={cn(buttonVariants({ variant: "gold" }), "mt-6 inline-flex")}>
        Tillbaka till dagens kluring
      </Link>
    </div>
  );
}

import Link from "next/link";
import Header from "@/components/Header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-lg py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">404</p>
      <h1 className="mt-3 font-serif text-4xl text-paper">This plate is missing</h1>
      <p className="mt-3 text-paper/65">The file number does not match the archive.</p>
      <Link href="/" className={cn(buttonVariants({ variant: "gold" }), "mt-6 inline-flex")}>
        Return to the desk
      </Link>
      </div>
    </>
  );
}

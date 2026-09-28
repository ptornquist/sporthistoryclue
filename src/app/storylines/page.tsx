import type { Metadata } from "next";
import { StorylinesHub } from "@/components/storylines/StorylinesHub";

export const metadata: Metadata = {
  title: "Storylines & Eras",
  description: "Curated historical campaigns. Follow legendary rivalries and pivotal eras through tactical dossiers.",
};

export default function StorylinesPage() {
  return <StorylinesHub />;
}

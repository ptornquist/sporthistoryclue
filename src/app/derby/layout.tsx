import type { ReactNode } from "react";

export const metadata = {
  title: "The Supporters Derby",
  description: "Which football club has the sharpest sports minds on the planet?",
};

export default function DerbyLayout({ children }: { children: ReactNode }) {
  return children;
}

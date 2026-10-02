import Link from "next/link";
import { scoutProfilePath } from "@/lib/scout-profile";

export function ScoutHandleLink({
  username,
  className = "hover:underline",
  children,
}: {
  username?: string | null;
  className?: string;
  children?: React.ReactNode;
}) {
  const handle = (username || "").replace(/^@/, "");
  const href = scoutProfilePath(username);
  const label = children ?? `@${handle || "scout"}`;
  if (!href) return <span className={className}>{label}</span>;
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

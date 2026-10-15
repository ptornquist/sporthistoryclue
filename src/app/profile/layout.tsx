import type { ReactNode } from "react";
import { ProfileGuard } from "./profile-guard";

export const metadata = {
  title: "Profile",
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <ProfileGuard>{children}</ProfileGuard>;
}

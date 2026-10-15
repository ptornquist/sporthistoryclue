"use client";

import { Component, type ReactNode } from "react";
import { ProfileRecovery } from "@/components/profile/ProfileRecovery";

interface State {
  failed: boolean;
}

/** Keeps language, country, and club usable when profile data throws during render. */
export class ProfileGuard extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.failed) return <ProfileRecovery />;
    return this.props.children;
  }
}

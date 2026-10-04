"use client";

import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export function AuthModal({
  open,
  onClose,
  initialMode = "signup",
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-zinc-200"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng"
          className="absolute top-4 right-4 text-zinc-400 hover:text-black text-xl font-bold w-8 h-8 rounded-full hover:bg-zinc-100"
        >
          ✕
        </button>
        <h2 id="auth-modal-title" className="text-xl font-black uppercase tracking-tight text-zinc-900 pr-8">
          Gå med i ligan
        </h2>
        <p className="mt-1 mb-4 text-xs text-zinc-500">
          Ett konto sparar dagens kluring, sviten och medaljerna på samma scout.
        </p>
        <AuthForm initialMode={initialMode} onAuthenticated={onClose} />
      </div>
    </div>
  );
}

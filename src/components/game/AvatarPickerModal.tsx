"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import {
  RETRO_AVATARS,
  announceAvatar,
  avatarFileExtension,
  avatarStoragePath,
  avatarTooLarge,
  isPhotoAvatar,
  retroAvatarEmoji,
} from "@/lib/avatars";

export function ProfileAvatarButton({
  avatarUrl,
  label,
  onClick,
}: {
  avatarUrl?: string | null;
  label: string;
  onClick: () => void;
}) {
  const initial = (label.replace(/^@/, "").trim().charAt(0) || "S").toUpperCase();
  const emoji = retroAvatarEmoji(avatarUrl);
  const photo = isPhotoAvatar(avatarUrl);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Change avatar"
      className="relative shrink-0 rounded-full"
    >
      {photo ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
      ) : emoji ? (
        <span className="flex w-24 h-24 items-center justify-center rounded-full border-4 border-white bg-zinc-100 text-4xl shadow-md">
          {emoji}
        </span>
      ) : (
        <span className="flex w-24 h-24 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-3xl font-black text-white shadow-md">
          {initial}
        </span>
      )}
      <span className="absolute -bottom-1 -right-1 bg-zinc-900 text-white p-2 rounded-full shadow hover:bg-blue-600 transition-all cursor-pointer">
        <Camera className="h-4 w-4" aria-hidden />
      </span>
    </button>
  );
}

export function AvatarPickerModal({
  open,
  userId,
  currentUrl,
  onClose,
  onSaved,
  onToast,
}: {
  open: boolean;
  userId: string | null;
  currentUrl?: string | null;
  onClose: () => void;
  onSaved: (avatarUrl: string) => void;
  onToast: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const previewEmoji = retroAvatarEmoji(currentUrl);

  const persist = async (avatarUrl: string) => {
    if (!userId) {
      setError("Sign in to save a scout badge.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabaseClient
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId)
        .select("id")
        .maybeSingle();
      if (updateError) throw updateError;
      if (!data) {
        const { error: insertError } = await supabaseClient
          .from("profiles")
          .upsert({ id: userId, avatar_url: avatarUrl });
        if (insertError) throw insertError;
      }
      onSaved(avatarUrl);
      announceAvatar(avatarUrl);
      onToast("Scout badge updated.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not save that badge.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (avatarTooLarge(file.size)) {
      setError("Choose a photo that is 3MB or smaller.");
      return;
    }
    const fileExt = avatarFileExtension(file);
    if (!fileExt || !userId) {
      setError(userId ? "Use a PNG, JPEG, or WebP photo." : "Sign in to upload a photo.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const path = avatarStoragePath(userId, fileExt);
      const { error: uploadError } = await supabaseClient.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (uploadError) throw uploadError;
      const { data } = supabaseClient.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      if (!publicUrl.startsWith("http")) throw new Error("Could not read the public photo URL.");
      await persist(publicUrl);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not upload that photo.";
      setError(message);
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-picker-title"
        className="relative bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 max-w-lg w-full shadow-2xl z-50 text-zinc-900 max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close avatar picker"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
        >
          ✕
        </button>
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Scout Badge</p>
        <h2 id="avatar-picker-title" className="mt-1 text-2xl font-black uppercase tracking-tight">
          Choose Your Look
        </h2>

        <div className="mt-4 flex justify-center">
          {isPhotoAvatar(currentUrl) ? (
            <img
              src={currentUrl}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : previewEmoji ? (
            <span className="flex w-24 h-24 items-center justify-center rounded-full border-4 border-white bg-zinc-100 text-4xl shadow-md">
              {previewEmoji}
            </span>
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-black text-white shadow-md">
              ?
            </span>
          )}
        </div>

        <section className="mt-6">
          <h3 className="text-sm font-black text-zinc-900">Choose Retro Sports Icon</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {RETRO_AVATARS.map((icon) => {
              const selected = currentUrl === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    void persist(icon.id);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-all ${
                    selected
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-zinc-200 bg-zinc-50 hover:border-blue-500"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {icon.emoji}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">{icon.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-black text-zinc-900">Upload Custom Photo</h3>
          <input
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void onFile(file);
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm tracking-wider uppercase shadow-md transition-all"
          >
            {busy ? "Saving…" : "Upload Photo"}
          </button>
        </section>

        {error && <p className="mt-4 text-center text-xs font-bold text-red-600">{error}</p>}
      </div>
    </div>
  );
}

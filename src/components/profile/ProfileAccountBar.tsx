export function ProfileAccountBar({
  changePhotoLabel,
  logoutLabel,
  busyLabel,
  uploading,
  signingOut,
  onChangePhoto,
  onSignOut,
}: {
  changePhotoLabel: string;
  logoutLabel: string;
  busyLabel: string;
  uploading: boolean;
  signingOut: boolean;
  onChangePhoto: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onChangePhoto}
        disabled={uploading}
        className="min-h-12 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black uppercase tracking-wider text-blue-800 hover:border-blue-600"
      >
        {uploading ? busyLabel : changePhotoLabel}
      </button>
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className="min-h-12 rounded-xl bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-rose-700"
      >
        {signingOut ? busyLabel : logoutLabel}
      </button>
    </div>
  );
}

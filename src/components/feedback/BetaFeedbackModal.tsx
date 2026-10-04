"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FEEDBACK_CATEGORIES, feedbackErrorText, prepareBetaFeedback, type FeedbackCategory } from "@/lib/beta-feedback";
import { supabaseClient } from "@/lib/supabase/client";

export function BetaFeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [comment, setComment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const dismiss = useCallback(() => {
    if (success) {
      setRating(0);
      setCategory("");
      setComment("");
      setSuccess(false);
    }
    setErrorMsg("");
    setSaving(false);
    onClose();
  }, [onClose, success]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dismiss]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    const prepared = prepareBetaFeedback({ rating, category, comment });
    if (!prepared.ok) {
      setErrorMsg(prepared.message);
      return;
    }
    const categoryString = prepared.row.category;
    const commentString = prepared.row.comment;
    setSaving(true);
    try {
      const { error } = await supabaseClient.from("beta_feedback").insert({
        rating: Number(rating),
        category: categoryString,
        comment: commentString,
      });
      if (error) {
        console.error("Feedback error:", error);
        setErrorMsg(feedbackErrorText(error));
        return;
      }
      setRating(0);
      setCategory("");
      setComment("");
      setSuccess(true);
    } catch (error) {
      console.error("Feedback error:", error);
      setErrorMsg(feedbackErrorText(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-feedback-title"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-zinc-200"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Stäng"
          className="absolute top-4 right-4 text-zinc-400 hover:text-black text-xl font-bold w-8 h-8 rounded-full hover:bg-zinc-100"
        >
          ✕
        </button>
        <h2 id="beta-feedback-title" className="text-xl font-black uppercase tracking-tight text-zinc-900 pr-8">
          Lämna beta-feedback
        </h2>
        <p className="mt-1 mb-4 text-xs text-zinc-500">Berätta vad som fungerar och vad som ska bli bättre.</p>

        {success ? (
          <div className="space-y-4" role="status">
            <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-6 text-center text-lg font-black text-emerald-800">
              Tack för din feedback!
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700"
            >
              Tack för din feedback!
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Betyg</legend>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Betyg ${value} av 5`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className={`h-10 w-10 rounded-xl border-2 text-sm font-black ${
                      rating === value
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-900"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Kategori</legend>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_CATEGORIES.map((item) => (
                  <label
                    key={item}
                    className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-xs font-bold uppercase ${
                      category === item ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback-category"
                      value={item}
                      checked={category === item}
                      onChange={() => setCategory(item)}
                      className="sr-only"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">Kommentar</span>
              <textarea
                required
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Vad hände, eller vad saknas?"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </label>

            {errorMsg ? <p className="text-sm font-medium text-rose-700 break-words">{errorMsg}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Sparar..." : "Skicka feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function BetaFeedbackButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:text-blue-600 hover:border-blue-600 text-xs font-bold uppercase tracking-wider transition-colors"
        }
      >
        Lämna beta-feedback
      </button>
      <BetaFeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

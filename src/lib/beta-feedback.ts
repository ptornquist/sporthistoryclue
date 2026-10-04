export const FEEDBACK_CATEGORIES = ["Bugg", "Idé", "Övrigt"] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

/** Columns the client may insert. Extra keys are omitted so RLS and unknown columns do not reject the row. */
export interface BetaFeedbackRow {
  rating: number;
  category: FeedbackCategory;
  comment: string;
}

export function prepareBetaFeedback(input: {
  rating: number;
  category: string;
  comment: string;
}): { ok: true; row: BetaFeedbackRow } | { ok: false; message: string } {
  const rating = Math.round(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, message: "Välj ett betyg från 1 till 5." };
  }
  if (!FEEDBACK_CATEGORIES.includes(input.category as FeedbackCategory)) {
    return { ok: false, message: "Välj Bugg, Idé eller Övrigt." };
  }
  const comment = input.comment.trim();
  if (!comment) return { ok: false, message: "Skriv en kort kommentar." };
  if (comment.length > 2000) return { ok: false, message: "Kommentaren får vara högst 2000 tecken." };
  return {
    ok: true,
    row: {
      rating,
      category: input.category as FeedbackCategory,
      comment,
    },
  };
}

export function feedbackErrorText(error: unknown): string {
  if (typeof error === "object" && error && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Feedback kunde inte sparas.";
}

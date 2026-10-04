export const FEEDBACK_CATEGORIES = ["Bugg", "Idé", "Övrigt"] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export interface BetaFeedbackRow {
  user_id: string | null;
  scout_name: string | null;
  rating: number;
  category: FeedbackCategory;
  comment: string;
  page_path: string | null;
}

export function prepareBetaFeedback(input: {
  rating: number;
  category: string;
  comment: string;
  scoutName?: string | null;
  pagePath?: string | null;
  userId?: string | null;
}): { ok: true; row: BetaFeedbackRow } | { ok: false; message: string } {
  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) return { ok: false, message: "Välj ett betyg från 1 till 5." };
  if (!FEEDBACK_CATEGORIES.includes(input.category as FeedbackCategory)) {
    return { ok: false, message: "Välj Bugg, Idé eller Övrigt." };
  }
  const comment = input.comment.trim();
  if (!comment) return { ok: false, message: "Skriv en kort kommentar." };
  if (comment.length > 2000) return { ok: false, message: "Kommentaren får vara högst 2000 tecken." };
  const scoutName = input.scoutName?.trim().replace(/^@+/, "").slice(0, 40) || null;
  const pagePath = input.pagePath?.trim().slice(0, 200) || null;
  const userId = input.userId?.trim() || null;
  return {
    ok: true,
    row: {
      user_id: userId,
      scout_name: scoutName,
      rating,
      category: input.category as FeedbackCategory,
      comment,
      page_path: pagePath,
    },
  };
}

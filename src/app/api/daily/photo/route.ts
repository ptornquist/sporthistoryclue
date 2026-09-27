import { isMatchKey, loadChallengeImage } from "@/lib/daily-drop";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!isMatchKey(id)) {
    return Response.json({ imageUrl: null });
  }
  const imageUrl = await loadChallengeImage(id);
  return Response.json({ imageUrl });
}

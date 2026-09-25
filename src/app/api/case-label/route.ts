import { solvedMatchup } from "@/lib/case-solutions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  const labels: Record<string, string> = {};
  for (const id of ids.slice(0, 24)) {
    const label = solvedMatchup(id);
    if (label) labels[id] = label;
  }
  return Response.json({ labels });
}

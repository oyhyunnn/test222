import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  let meetings: Array<{
    id: string;
    title: string;
    summary: string | null;
    created_at: string;
  }> = [];
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("meetings")
      .select("id,title,summary,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) loadError = error.message;
    else meetings = data ?? [];
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">회의록 히스토리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Supabase 에 저장된 회의록 목록입니다.
        </p>
      </div>

      {loadError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          데이터를 불러오지 못했습니다: {loadError}
        </div>
      )}

      {meetings.length === 0 && !loadError && (
        <div className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-sm text-muted-foreground">
          아직 저장된 회의록이 없습니다.{" "}
          <Link href="/" className="text-primary hover:underline">
            새 회의록 작성하기
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {meetings.map((m) => (
          <li key={m.id}>
            <Link
              href={`/history/${m.id}`}
              className="block rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium">{m.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {m.summary || "요약 없음"}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString("ko-KR")}
                </time>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import CopyButton from "@/components/CopyButton";
import type { MeetingAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseClient();

  const { data: meeting, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !meeting) {
    notFound();
  }

  const { data: actionItems } = await supabase
    .from("action_items")
    .select("*")
    .eq("meeting_id", params.id);

  const analysis: MeetingAnalysis = {
    summary: meeting.summary ?? "",
    participants: (meeting.participants as string[]) ?? [],
    agenda: (meeting.agenda as string[]) ?? [],
    decisions: (meeting.decisions as string[]) ?? [],
    action_items: (actionItems ?? []).map((a) => ({
      assignee: a.assignee,
      task: a.task,
      due_date: a.due_date,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/history"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 히스토리로 돌아가기
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(meeting.created_at).toLocaleString("ko-KR")}
            </p>
          </div>
          <CopyButton title={meeting.title} analysis={analysis} />
        </div>
      </div>

      <Section title="요약">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {analysis.summary || "-"}
        </p>
      </Section>

      <Section title="참석자">
        <p className="text-sm">
          {analysis.participants.length ? analysis.participants.join(", ") : "-"}
        </p>
      </Section>

      <Section title="안건">
        {analysis.agenda.length ? (
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {analysis.agenda.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm">-</p>
        )}
      </Section>

      <Section title="결정사항">
        {analysis.decisions.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {analysis.decisions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">-</p>
        )}
      </Section>

      <Section title="액션 아이템">
        {analysis.action_items.length ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2">담당자</th>
                <th className="py-2 pr-2">할 일</th>
                <th className="py-2">기한</th>
              </tr>
            </thead>
            <tbody>
              {analysis.action_items.map((item, idx) => (
                <tr key={idx} className="border-b border-border last:border-0">
                  <td className="py-2 pr-2 align-top">{item.assignee}</td>
                  <td className="py-2 pr-2 align-top">{item.task}</td>
                  <td className="py-2 align-top">{item.due_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm">-</p>
        )}
      </Section>

      <Section title="원본">
        <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
          {meeting.raw_content}
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

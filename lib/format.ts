import type { MeetingAnalysis } from "./types";

export function formatForClipboard(title: string, analysis: MeetingAnalysis): string {
  const lines: string[] = [];
  lines.push(`📝 ${title || "회의록"}`);
  lines.push("");
  lines.push("■ 요약");
  lines.push(analysis.summary || "-");
  lines.push("");

  lines.push("■ 참석자");
  lines.push(analysis.participants.length ? analysis.participants.join(", ") : "-");
  lines.push("");

  lines.push("■ 안건");
  if (analysis.agenda.length) {
    analysis.agenda.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
  } else {
    lines.push("-");
  }
  lines.push("");

  lines.push("■ 결정사항");
  if (analysis.decisions.length) {
    analysis.decisions.forEach((d) => lines.push(`• ${d}`));
  } else {
    lines.push("-");
  }
  lines.push("");

  lines.push("■ 액션 아이템");
  if (analysis.action_items.length) {
    analysis.action_items.forEach((item) => {
      lines.push(`• [${item.assignee}] ${item.task} (기한: ${item.due_date})`);
    });
  } else {
    lines.push("-");
  }

  return lines.join("\n");
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { analyzeMeeting, saveMeeting } from "@/app/actions";
import { formatForClipboard } from "@/lib/format";
import type { ActionItem, MeetingAnalysis } from "@/lib/types";

const EMPTY_ANALYSIS: MeetingAnalysis = {
  summary: "",
  participants: [],
  agenda: [],
  decisions: [],
  action_items: [],
};

export default function MeetingEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isAnalyzing, startAnalyze] = useTransition();
  const [isSaving, startSave] = useTransition();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleAnalyze = () => {
    setError(null);
    startAnalyze(async () => {
      const res = await analyzeMeeting(rawContent);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setAnalysis(res.data);
    });
  };

  const handleSave = () => {
    if (!analysis) return;
    setError(null);
    startSave(async () => {
      const res = await saveMeeting({ title, raw_content: rawContent, analysis });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      showToast("Supabase 에 저장되었습니다.");
      router.push(`/history`);
    });
  };

  const handleCopy = async () => {
    if (!analysis) return;
    const text = formatForClipboard(title, analysis);
    try {
      await navigator.clipboard.writeText(text);
      showToast("클립보드에 복사되었습니다.");
    } catch {
      showToast("복사에 실패했습니다.");
    }
  };

  const updateListItem = (
    key: "participants" | "agenda" | "decisions",
    idx: number,
    value: string,
  ) => {
    if (!analysis) return;
    const next = [...analysis[key]];
    next[idx] = value;
    setAnalysis({ ...analysis, [key]: next });
  };

  const addListItem = (key: "participants" | "agenda" | "decisions") => {
    if (!analysis) return;
    setAnalysis({ ...analysis, [key]: [...analysis[key], ""] });
  };

  const removeListItem = (
    key: "participants" | "agenda" | "decisions",
    idx: number,
  ) => {
    if (!analysis) return;
    setAnalysis({ ...analysis, [key]: analysis[key].filter((_, i) => i !== idx) });
  };

  const updateActionItem = (idx: number, patch: Partial<ActionItem>) => {
    if (!analysis) return;
    const next = analysis.action_items.map((item, i) =>
      i === idx ? { ...item, ...patch } : item,
    );
    setAnalysis({ ...analysis, action_items: next });
  };

  const addActionItem = () => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      action_items: [
        ...analysis.action_items,
        { assignee: "미정", task: "", due_date: "미정" },
      ],
    });
  };

  const removeActionItem = (idx: number) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      action_items: analysis.action_items.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">1. 회의 내용 입력</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="회의 제목 (선택)"
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="회의 내용을 붙여넣으세요"
            rows={12}
            className="w-full rounded-md border border-border px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {rawContent.length.toLocaleString()} 자
            </span>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || rawContent.trim().length < 10}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? "AI 가 분석 중..." : "AI 로 분석하기"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {analysis && (
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">2. AI 분석 결과 (편집 가능)</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                복사
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "Supabase 에 저장"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <Field label="요약">
              <textarea
                value={analysis.summary}
                onChange={(e) => setAnalysis({ ...analysis, summary: e.target.value })}
                rows={4}
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </Field>

            <ListField
              label="참석자"
              items={analysis.participants}
              onChange={(i, v) => updateListItem("participants", i, v)}
              onAdd={() => addListItem("participants")}
              onRemove={(i) => removeListItem("participants", i)}
              placeholder="이름"
            />

            <ListField
              label="안건"
              items={analysis.agenda}
              onChange={(i, v) => updateListItem("agenda", i, v)}
              onAdd={() => addListItem("agenda")}
              onRemove={(i) => removeListItem("agenda", i)}
              placeholder="안건 내용"
            />

            <ListField
              label="결정사항"
              items={analysis.decisions}
              onChange={(i, v) => updateListItem("decisions", i, v)}
              onAdd={() => addListItem("decisions")}
              onRemove={(i) => removeListItem("decisions", i)}
              placeholder="결정사항 내용"
            />

            <Field label="액션 아이템">
              <div className="space-y-2">
                {analysis.action_items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 rounded-md border border-border p-2"
                  >
                    <input
                      value={item.assignee}
                      onChange={(e) =>
                        updateActionItem(idx, { assignee: e.target.value })
                      }
                      placeholder="담당자"
                      className="col-span-3 rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <input
                      value={item.task}
                      onChange={(e) => updateActionItem(idx, { task: e.target.value })}
                      placeholder="할 일"
                      className="col-span-6 rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <input
                      value={item.due_date}
                      onChange={(e) =>
                        updateActionItem(idx, { due_date: e.target.value })
                      }
                      placeholder="기한"
                      className="col-span-2 rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeActionItem(idx)}
                      className="col-span-1 rounded-md text-xs text-muted-foreground hover:text-red-600"
                      aria-label="삭제"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addActionItem}
                  className="text-xs text-primary hover:underline"
                >
                  + 액션 아이템 추가
                </button>
              </div>
            </Field>
          </div>
        </section>
      )}

      {!analysis && (
        <div className="rounded-lg border border-dashed border-border bg-white/50 p-8 text-center text-sm text-muted-foreground">
          분석을 실행하면 이곳에 결과가 표시됩니다.
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function ListField({
  label,
  items,
  onChange,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (idx: number, value: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  placeholder: string;
}) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((value, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              value={value}
              onChange={(e) => onChange(idx, e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="rounded-md px-2 text-xs text-muted-foreground hover:text-red-600"
            >
              삭제
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="text-xs text-primary hover:underline"
        >
          + 항목 추가
        </button>
      </div>
    </Field>
  );
}

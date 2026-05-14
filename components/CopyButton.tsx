"use client";

import { useState } from "react";
import { formatForClipboard } from "@/lib/format";
import type { MeetingAnalysis } from "@/lib/types";

export default function CopyButton({
  title,
  analysis,
}: {
  title: string;
  analysis: MeetingAnalysis;
}) {
  const [label, setLabel] = useState("복사");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatForClipboard(title, analysis));
      setLabel("복사됨!");
      setTimeout(() => setLabel("복사"), 1500);
    } catch {
      setLabel("실패");
      setTimeout(() => setLabel("복사"), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-sm hover:bg-muted"
    >
      {label}
    </button>
  );
}

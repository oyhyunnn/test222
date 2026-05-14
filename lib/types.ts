export type ActionItem = {
  assignee: string;
  task: string;
  due_date: string;
};

export type MeetingAnalysis = {
  summary: string;
  participants: string[];
  agenda: string[];
  decisions: string[];
  action_items: ActionItem[];
};

export type MeetingRecord = MeetingAnalysis & {
  id: string;
  title: string;
  raw_content: string;
  created_at: string;
};

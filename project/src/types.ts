export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  followUps?: string[]; // ✅ optional follow-up questions
}

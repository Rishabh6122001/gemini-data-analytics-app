export interface ChartData {
  type: "bar" | "line" | "pie" | "scatter" | "area"; // extended chart types
  data: any[];
  xKey: string;
  yKey: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  timestamp: Date;

  // Text parts
  content?: string;   // for user raw input
  answer?: string;    // for assistant structured response

  // Extras
  followUps?: string[];
  chart?: ChartData;
}

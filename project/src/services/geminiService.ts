import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  private model;
  private chatHistory: { role: "user" | "model"; content: string }[] = [];
  private lastChart: any = null;

  constructor() {
    const apiKey = "AIzaSyA6akDT02z4sS-y2H48RtxpuLpR3ahwifg"; // 🔑 replace with your Gemini API key
    if (!apiKey) throw new Error("Gemini API key is missing.");

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  // 👋 Casual conversation check
  private isCasualConversation(query: string): boolean {
    const casualKeywords = [
      "hi", "hello", "hey", "thanks", "thank you",
      "ok", "okay", "good morning", "good evening", "good night",
      "how are you", "bye", "see you", "take care"
    ];
    return casualKeywords.some((kw) => query.toLowerCase().includes(kw));
  }

  // 📊 Smarter Analytics Query Check (keywords + Gemini fallback + tolerance for gibberish)
  private async isDataAnalyticsQuery(query: string): Promise<boolean> {
    const text = query.toLowerCase();

    // ✅ Fast path: obvious analytics/statistics terms
    const quickPatterns = [
      /p[\s-]?value/, /z[\s-]?score/, /t[\s-]?test/,
      /chi[\s-]?square/, /anova/, /regression/,
      /correlation/, /distribution/, /forecast/,
      /probability/, /variance/, /standard deviation/,
      /mean/, /median/, /mode/, /outlier/,
      /clustering/, /classification/, /machine learning/
    ];
    if (quickPatterns.some((p) => p.test(text))) return true;

    // 🔮 AI fallback: let Gemini interpret intent, even if messy
    try {
      const check = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: `You are an intent classifier.
Determine if the following query is related to data analytics, statistics, data science, or visualization.
Even if the wording is messy or unclear, decide based on meaning.

Answer only with "YES" or "NO".

Query: "${query}"`
          }]
        }]
      });

      const reply = check.response.text().trim().toLowerCase();

      // ✅ Default to YES if unsure (safer to answer than refuse)
      if (reply.includes("yes")) return true;
      if (reply.includes("no")) return false;
      return true;

    } catch (err) {
      console.error("⚠️ Gemini classification error:", err);
      // Fallback safe: assume it's analytics
      return true;
    }
  }

  // 🔎 Detect chart keys
  private detectKeys(dataset: any[]): { xKey: string; yKey: string } {
    if (!dataset || dataset.length === 0) return { xKey: "x", yKey: "y" };
    const sample = dataset[0];
    const keys = Object.keys(sample);
    let xKey = keys[0], yKey = keys[1] || keys[0];
    for (const k of keys) {
      if (typeof sample[k] === "string") xKey = k;
      if (typeof sample[k] === "number") yKey = k;
    }
    return { xKey, yKey };
  }

  // 🧠 Generate response
  async generateResponse(
    query: string,
    dataset: any[] = [],
    fileName: string | null = null
  ): Promise<{ answer: string; followUps: string[]; type: string; chart?: any }> {

    // Save user query
    this.chatHistory.push({ role: "user", content: query });

    // 👋 Casual conversation
    if (this.isCasualConversation(query)) {
      const response = {
        answer: "👋 Hey there! I’m your Data Analytics Assistant.",
        followUps: ["📊 Show me a bar chart example", "📈 Sales trend?", "🗂️ Upload dataset?"],
        type: "casual"
      };
      this.chatHistory.push({ role: "model", content: response.answer });
      return response;
    }

    // 🚫 Out-of-domain check (smarter now)
    const isAnalytics = await this.isDataAnalyticsQuery(query);
    if (!isAnalytics && dataset.length === 0) {
      const response = {
        answer: "⚡ Oops, that’s outside my scope!\nI can only help with data analytics, charts, insights, and statistics.",
        followUps: ["📊 Show me a bar chart", "📈 Visualize sales trends", "🧹 How do I clean messy data?"],
        type: "out-of-domain"
      };
      this.chatHistory.push({ role: "model", content: response.answer });
      return response;
    }

    // 🔄 Reuse last chart when asked "above/previous values"
    if (dataset.length === 0 && /above|previous|earlier|that data/i.test(query) && this.lastChart) {
      const response = {
        answer: "✅ Using the previously shared dataset to create your chart.",
        followUps: ["📈 Show as line chart", "🟠 Show as pie chart", "🔄 Compare with another column"],
        type: "analytics",
        chart: this.lastChart
      };
      this.chatHistory.push({ role: "model", content: response.answer });
      return response;
    }

    // 📂 If dataset uploaded → build chart
    if (dataset.length > 0) {
      const { xKey, yKey } = this.detectKeys(dataset);
      this.lastChart = { type: "bar", data: dataset, xKey, yKey };

      const response = {
        answer: `✅ Here’s a chart based on your uploaded file **${fileName || "dataset"}**.`,
        followUps: ["📈 Line chart?", "🟠 Pie chart?", "📊 Compare columns?"],
        type: "analytics",
        chart: this.lastChart
      };
      this.chatHistory.push({ role: "model", content: response.answer });
      return response;
    }

    // 🤖 Query Gemini with history
    try {
      const result = await this.model.generateContent({
        contents: this.chatHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }))
      });

      let rawText = result.response.text();
      rawText = rawText.replace(/```json|```/g, "").trim();

      let chart: any = undefined;
      const chartMatch = rawText.match(/CHART:\s*({[\s\S]*?})/);
      if (chartMatch) {
        try { chart = JSON.parse(chartMatch[1]); this.lastChart = chart; } catch {}
      }

      let followUps: string[] = [];
      const followMatch = rawText.match(/FOLLOW_UPS:\s*(\[.*\])/s);
      if (followMatch) {
        try { followUps = JSON.parse(followMatch[1]); } catch {}
      }

      const cleanAnswer = rawText
        .replace(/CHART:\s*{[\s\S]*?}/, "")
        .replace(/FOLLOW_UPS:\s*\[.*\]/s, "")
        .trim();

      const response = {
        answer: cleanAnswer || "✅ Here’s an insight!",
        followUps: followUps.length ? followUps : ["📊 Bar chart?", "📈 Line chart?", "🟠 Pie chart?"],
        type: "analytics",
        chart
      };

      this.chatHistory.push({ role: "model", content: response.answer });
      return response;

    } catch (error) {
      console.error("❌ Gemini API error:", error);
      return {
        answer: "⚠️ Something went wrong.",
        followUps: ["📊 Bar chart?", "📈 Line chart?", "🟠 Pie chart?"],
        type: "error"
      };
    }
  }
}

export const geminiService = new GeminiService();

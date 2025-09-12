import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  private model;
  private chatHistory: { role: "user" | "model"; content: string }[] = [];
  private lastChart: any = null;

  constructor() {
    const apiKey = "AIzaSyBtfINXuN8-3aDQKNJneRxLtI8-rgNt_Gs"; // 🔑 replace with your Gemini API key 
    if (!apiKey) throw new Error("Gemini API key is missing.");

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  // 👋 Handle casual conversation
  private async handleCasualConversation(query: string): Promise<string | null> {
    const text = query.trim().toLowerCase();

    if (/thank(s| you| u)?|thx+|ty+/.test(text)) return "You're welcome! 😊";
    if (/^(hi+|hello+|hey+|heyyy+|hiii+)$/i.test(text)) return "👋 Hey there!";
    if (/bye+|see you|take care|byeee/i.test(text)) return "Goodbye! Take care 👋";
    if (/good\s*morning|mrnng+|gm+/i.test(text)) return "🌞 Good morning!";
    if (/good\s*evening|ge+/i.test(text)) return "🌆 Good evening!";
    if (/good\s*night|gdnite+|gn+/i.test(text)) return "🌙 Good night!";
    if (/how\s*are\s*you|hw r u|hru/i.test(text)) return "I'm doing great, thanks for asking! How about you?";
    if (/ok(ay+)?|okk+|k+/.test(text)) return "👍 Okay!";

    return null;
  }

  // 🌀 Detect gibberish (fixed)
  private isGibberish(text: string): boolean {
    const cleaned = text.trim().toLowerCase();

    // ✅ Allow common short words
    const validShortWords = ["hi", "ok", "no", "yes", "yo", "hey", "bye", "gm", "gn", "ty"];
    if (validShortWords.includes(cleaned)) return false;

    if (cleaned.length < 3) return true; // too short
    if (!/[aeiou]/.test(cleaned)) return true; // no vowels
    if (/^(.)\1{2,}$/.test(cleaned)) return true; // same char repeated
    if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(cleaned)) return true; // only consonants
    const consonantRatio = (cleaned.replace(/[^bcdfghjklmnpqrstvwxyz]/gi, "").length / cleaned.length);
    if (consonantRatio > 0.7) return true; // too many consonants
    if (/[a-z]{3,}\d+[a-z\d]*/i.test(cleaned)) return true; // nonsense mix with numbers

    return false;
  }

  // 📊 Check if query is analytics-related
  private async isDataAnalyticsQuery(query: string): Promise<boolean> {
    const text = query.toLowerCase();

    const quickPatterns = [
      /p[\s-]?value/, /z[\s-]?score/, /t[\s-]?test/,
      /chi[\s-]?square/, /anova/, /regression/,
      /correlation/, /distribution/, /forecast/,
      /probability/, /variance/, /standard deviation/,
      /mean/, /median/, /mode/, /outlier/,
      /clustering/, /classification/, /machine learning/,
      /data/, /dataset/, /chart/, /visualize/, /insight/, /trend/
    ];
    if (quickPatterns.some((p) => p.test(text))) return true;

    try {
      const check = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: `You are an intent classifier.
Decide if this query is related to data analytics, statistics, data science, or visualization.
Answer only with "YES" or "NO".

Query: "${query}"`
          }]
        }]
      });

      const reply = check.response.text().trim().toLowerCase();
      return reply.includes("yes");
    } catch {
      return false; // fallback
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

    this.chatHistory.push({ role: "user", content: query });

    // 🚫 Gibberish check first
    if (this.isGibberish(query)) {
      const response = {
        answer: "🤔 Sorry, I didn’t quite get that. Could you rephrase?",
        followUps: ["📊 Show me a chart example", "📈 Sales trend?", "🧹 Clean messy data?"],
        type: "gibberish"
      };
      this.chatHistory.push({ role: "model", content: response.answer });
      return response;
    }

    // 👋 Casual
    const casualResponse = await this.handleCasualConversation(query);
    if (casualResponse) {
      const response = {
        answer: casualResponse,
        followUps: ["📊 Show me a bar chart example", "📈 Sales trend?", "🗂️ Upload dataset?"],
        type: "casual"
      };
      this.chatHistory.push({ role: "model", content: response.answer });
      return response;
    }

    // 🚫 Out-of-domain
    const isAnalytics = await this.isDataAnalyticsQuery(query);
    if (!isAnalytics && dataset.length === 0) {
      const response = {
        answer: "⚡ That’s outside my scope!\nI can help with data analytics, statistics, charts, and insights only.",
        followUps: ["📊 Show me a bar chart", "📈 Visualize sales trends", "🧹 How do I clean messy data?"],
        type: "out-of-domain"
      };
      this.chatHistory.push({ role: "model", content: response.answer });
      return response;
    }

    // 🔄 Reuse chart
    if (dataset.length === 0 && /above|previous|earlier|that data/i.test(query) && this.lastChart) {
      const response = {
        answer: "✅ Using the previously shared dataset to create your chart.",
        followUps: ["📈 Line chart?", "🟠 Pie chart?", "🔄 Compare with another column"],
        type: "analytics",
        chart: this.lastChart
      };
      this.chatHistory.push({ role: "model", content: response.answer });
      return response;
    }

    // 📂 Dataset → chart
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

    // 🆕 Handle follow-ups like "in detail"
    const followUpPatterns = /(in detail|explain|explain more|explain again|clarify|why|how|tell me more|expand|give example|elaborate)/i;
    let contextPrompt = query;

    if (followUpPatterns.test(query)) {
      const lastUser = [...this.chatHistory].reverse().find(m => m.role === "user" && m.content !== query);
      const lastModel = [...this.chatHistory].reverse().find(m => m.role === "model");

      if (lastUser && lastModel) {
        contextPrompt = `The user previously asked: "${lastUser.content}"\nYou answered: "${lastModel.content}".\n\nNow the user says: "${query}".\n\n👉 Expand your previous answer in much more detail, with clear explanation, structured points, and practical examples.`;
      }
    }

    // 🤖 Gemini call (only for analytics scope)
    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: contextPrompt }] }]
      });

      let rawText = result.response.text();
      rawText = rawText.replace(/```json|```/g, "").trim();

      // Optional chart parsing
      let chart: any = undefined;
      const chartMatch = rawText.match(/CHART:\s*({[\s\S]*?})/);
      if (chartMatch) {
        try { chart = JSON.parse(chartMatch[1]); this.lastChart = chart; } catch {}
      }

      // Extract follow-ups
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
        answer: "⚠️ Something went wrong while generating a response.",
        followUps: ["📊 Bar chart?", "📈 Line chart?", "🟠 Pie chart?"],
        type: "error"
      };
    }
  }
}

export const geminiService = new GeminiService();

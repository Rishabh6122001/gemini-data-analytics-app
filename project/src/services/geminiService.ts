import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  private model;

  constructor() {
    // 🔑 Hardcoded API Key (replace with yours)
    const apiKey = "YOUR_GEMINI_API_KEY";

    if (!apiKey) {
      throw new Error("Gemini API key is missing.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // 👋 Casual conversation detection
  private isCasualConversation(query: string): boolean {
    const casual = [
      "hi", "hello", "hey", "good morning", "good evening",
      "how are you", "i am fine", "thanks", "thank you", "thank u",
      "what's up", "ok", "okay", "cool", "nice", "bye", "goodbye",
      "see you", "take care"
    ];
    const q = query.toLowerCase().trim();
    return casual.some((c) => q.includes(c));
  }

  // 📊 Analytics-related queries
  private isDataAnalyticsQuery(query: string): boolean {
    const keywords = [
      "data", "analytics", "analysis", "statistics", "dataset", "database",
      "visualization", "chart", "graph", "dashboard", "reporting", "metrics",
      "sql", "python", "pandas", "numpy", "matplotlib", "seaborn",
      "tableau", "power bi", "excel", "regression", "correlation", "clustering",
      "machine learning", "forecasting", "trend", "pattern",
      "business intelligence", "etl", "data warehouse", "data mining", "big data",
      "spark", "mongodb", "postgresql", "mysql", "snowflake",
      "data science", "hypothesis testing", "a/b testing",
      "confidence interval", "data cleaning", "feature engineering",
    ];
    const q = query.toLowerCase();
    return keywords.some((kw) => q.includes(kw));
  }

  async generateResponse(
    query: string
  ): Promise<{ answer: string; followUps: string[] }> {
    // 👋 Casual chit-chat
    if (this.isCasualConversation(query)) {
      return {
        answer: "😊 I’m here! Always happy to chat. Do you want to dive into data analytics?",
        followUps: [], // no follow-ups for casual
      };
    }

    // 📊 Analytics queries
    if (this.isDataAnalyticsQuery(query)) {
      try {
        const result = await this.model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are a specialized Data Analytics Expert Chatbot.

Instructions:
- Provide a clear, structured, professional answer.
- Use emojis/icons for clarity (📊, ✅, ⚠️).
- Avoid markdown symbols (#, *, **).
- After answering, suggest 3 short follow-up questions.
- Format follow-ups in JSON array like:
FOLLOW_UPS: ["Question 1", "Question 2", "Question 3"]

Now answer this query:

${query}
                  `,
                },
              ],
            },
          ],
        });

        const rawText = result.response.text();

        // Extract follow-ups
        let followUps: string[] = [];
        const match = rawText.match(/FOLLOW_UPS:\s*(\[.*\])/);
        if (match) {
          try {
            followUps = JSON.parse(match[1]);
          } catch (err) {
            console.warn("⚠️ Failed to parse follow-ups:", err);
          }
        }

        // Clean the main answer
        const cleanAnswer = rawText.replace(/FOLLOW_UPS:\s*\[.*\]/, "").trim();

        return { answer: cleanAnswer, followUps };
      } catch (error) {
        console.error("❌ Error calling Gemini API:", error);
        return {
          answer: "⚠️ I encountered an error while generating a response.",
          followUps: [],
        };
      }
    }

    // ❌ Block unrelated queries
    return {
      answer:
        "⚠️ I can help only with **data analytics** or friendly chat (hi, hello, thank you, etc.). Try asking me about statistics, visualization, BI, or machine learning!",
      followUps: [],
    };
  }
}

export const geminiService = new GeminiService();

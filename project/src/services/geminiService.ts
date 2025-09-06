import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  private model;

  constructor() {
    // 🔑 Hardcoded API Key (replace with yours)
    const apiKey = "AIzaSyBtfINXuN8-3aDQKNJneRxLtI8-rgNt_Gs";

    if (!apiKey) {
      throw new Error("Gemini API key is missing.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  private isGreeting(query: string): boolean {
    const greetings = ["hi", "hello", "hey", "good morning", "good evening"];
    const q = query.toLowerCase().trim();
    return greetings.some((g) => q.startsWith(g));
  }

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
    // 👋 Greetings → friendly welcome
    if (this.isGreeting(query)) {
      return {
        answer: "👋 Hello! I’m your Data Analytics AI Assistant. How can I help you today?",
        followUps: [
          "📊 What are some common data visualization techniques?",
          "📈 How do I analyze sales trends?",
          "🤖 What is machine learning in data analytics?"
        ],
      };
    }

    // 📊 Analytics queries → structured expert mode
    if (this.isDataAnalyticsQuery(query)) {
      try {
        const result = await this.model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are a specialized data analytics expert chatbot.

Instructions:
- Provide a clear, structured, professional answer.
- Use emojis/icons for sections (📊, ✅, ⚠️).
- Avoid markdown symbols (#, *, **).
- After answering, suggest 3 short follow-up questions relevant to the query.
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

        // Extract follow-ups if present
        let followUps: string[] = [];
        const match = rawText.match(/FOLLOW_UPS:\s*(\[.*\])/);
        if (match) {
          try {
            followUps = JSON.parse(match[1]);
          } catch (err) {
            console.warn("⚠️ Failed to parse follow-ups:", err);
          }
        }

        // Clean main answer
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

    // 💬 General conversation → natural chatbot response
    try {
      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are a friendly conversational AI.

Instructions:
- Reply naturally and casually, like a human chat partner.
- Be polite, engaging, and concise.
- Adapt tone based on context (e.g., jokes if asked, gratitude if thanked).
- Do NOT include FOLLOW_UPS here.

Now reply to this user message:

${query}
                `,
              },
            ],
          },
        ],
      });

      const responseText = result.response.text();
      return { answer: responseText, followUps: [] };
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error);
      return {
        answer: "⚠️ I encountered an error while generating a response.",
        followUps: [],
      };
    }
  }
}

export const geminiService = new GeminiService();

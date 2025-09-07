import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  private model;

  constructor() {
    // 🔑 Hardcoded API Key
    const apiKey = "YOUR_API_KEY_HERE";
    if (!apiKey) {
      throw new Error("Gemini API key is missing.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  private isCasualConversation(query: string): boolean {
    const casualKeywords = [
      "hi", "hello", "hey", "thanks", "thank you", "ok", "okay",
      "good morning", "good evening", "good night", "how are you",
      "bye", "see you", "take care"
    ];
    const q = query.toLowerCase().trim();
    return casualKeywords.some((kw) => q.includes(kw));
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
      "confidence interval", "data cleaning", "feature engineering"
    ];
    const q = query.toLowerCase();
    return keywords.some((kw) => q.includes(kw));
  }

  async generateResponse(
    query: string
  ): Promise<{ answer: string; followUps: string[] }> {
    // 👋 Casual conversation
    if (this.isCasualConversation(query)) {
      return {
        answer: "😊 Sure! I’m here to help you with data analytics whenever you’re ready.",
        followUps: [
          "📊 Want me to explain regression analysis?",
          "📈 Curious about sales trend forecasting?",
          "🤖 Should I show how machine learning fits into analytics?"
        ],
      };
    }

    // 📊 Data analytics queries
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

    // 🚫 Block unrelated questions
    return {
      answer:
        "🤖 I’m designed only for **data analytics, statistics, visualization, and BI**. Try asking me about regression, SQL, or dashboards instead.",
      followUps: [
        "📊 What’s regression analysis?",
        "📈 How to visualize trends?",
        "🛠️ What’s data cleaning?",
      ],
    };
  }
}

export const geminiService = new GeminiService();

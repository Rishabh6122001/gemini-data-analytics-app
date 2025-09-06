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

  private isDataAnalyticsQuery(query: string): boolean {
    const dataAnalyticsKeywords = [
      "data", "analytics", "analysis", "statistics", "statistical", "dataset", "database",
      "visualization", "chart", "graph", "dashboard", "reporting", "metrics", "kpi",
      "sql", "python", "r programming", "pandas", "numpy", "matplotlib", "seaborn",
      "tableau", "power bi", "excel", "regression", "correlation", "clustering",
      "machine learning", "predictive", "forecasting", "trend", "pattern",
      "business intelligence", "etl", "data warehouse", "data mining", "big data",
      "hadoop", "spark", "mongodb", "postgresql", "mysql", "snowflake",
      "data science", "data scientist", "data analyst", "hypothesis testing",
      "a/b testing", "statistical significance", "confidence interval",
      "data cleaning", "data preprocessing", "feature engineering", "outlier",
      "distribution", "variance", "standard deviation", "mean", "median", "mode",
    ];

    const queryLower = query.toLowerCase();
    return dataAnalyticsKeywords.some((keyword) => queryLower.includes(keyword));
  }

  async generateResponse(query: string): Promise<string> {
    if (!this.isDataAnalyticsQuery(query)) {
      return "🤖 I can only assist with data analytics queries. Please ask questions about statistics, data analysis, visualization, BI, or data science.";
    }

    try {
      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are a specialized data analytics expert. 
When answering, follow these formatting rules:
- Do NOT use markdown symbols (#, *, **). 
- Use emojis/icons for headings, lists, and highlights (📊, ✅, ⚠️).
- Structure content with indentation and spacing.
- Make it easy to read like professional notes, similar to how ChatGPT replies.

Now answer clearly and practically:

${query}
                `,
              },
            ],
          },
        ],
      });

      return result.response.text();
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

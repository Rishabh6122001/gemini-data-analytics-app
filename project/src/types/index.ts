export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ApiConfig {
  apiKey: string;
  isConfigured: boolean;
}
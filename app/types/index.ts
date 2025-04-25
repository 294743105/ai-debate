export interface ModelConfig {
  id: string;
  name: string;
  modelId: string;
  apiEndpoint: string;
  apiKey: string;
}

export interface DebateMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  side: 'pro' | 'con';
}

export interface DebateState {
  topic: string;
  messages: DebateMessage[];
  isDebating: boolean;
  currentSide: 'pro' | 'con';
}

export interface StoredModels {
  [id: string]: ModelConfig;
} 
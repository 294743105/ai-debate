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
  side: 'pro1' | 'con1' | 'pro2' | 'con2';
}

export interface DebateState {
  topic: string;
  messages: DebateMessage[];
  isDebating: boolean;
  currentSide: 'pro1' | 'con1' | 'pro2' | 'con2';
  mode: 'solo' | 'team';
}

export interface StoredModels {
  [id: string]: ModelConfig;
} 
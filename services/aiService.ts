// AI Service for ChatAnywhere API
export interface ModelConfig {
  id: string;
  name: string;
  dailyLimit: number;
  group: 'premium' | 'standard' | 'basic';
}

export const MODELS: ModelConfig[] = [
  // Premium models - 5次/天
  { id: 'gpt-5.1', name: 'GPT-5.1', dailyLimit: 5, group: 'premium' },
  { id: 'gpt-5', name: 'GPT-5', dailyLimit: 5, group: 'premium' },
  { id: 'gpt-4o', name: 'GPT-4o', dailyLimit: 5, group: 'premium' },
  { id: 'gpt-4.1', name: 'GPT-4.1', dailyLimit: 5, group: 'premium' },
  
  // Standard models - 30次/天
  { id: 'deepseek-r1', name: 'DeepSeek R1', dailyLimit: 30, group: 'standard' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', dailyLimit: 30, group: 'standard' },
  { id: 'deepseek-v3-2-exp', name: 'DeepSeek V3.2 Exp', dailyLimit: 30, group: 'standard' },
  
  // Basic models - 200次/天
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', dailyLimit: 200, group: 'basic' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', dailyLimit: 200, group: 'basic' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', dailyLimit: 200, group: 'basic' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', dailyLimit: 200, group: 'basic' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', dailyLimit: 200, group: 'basic' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', dailyLimit: 200, group: 'basic' },
];

export const API_BASE_URL = 'https://api.chatanywhere.tech';
export const DEFAULT_API_KEY = 'sk-DMVVheSxs56jFFWG9Tu8hEt7iK48rnj5Xs34mFJEKhUA24zJ';

// Usage tracking
const USAGE_KEY_PREFIX = 'ai_usage_';

interface DailyUsage {
  date: string; // YYYY-MM-DD
  counts: Record<string, number>; // modelId -> count
}

export const getDailyUsage = (modelId: string): number => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `${USAGE_KEY_PREFIX}${today}`;
    const data = localStorage.getItem(key);
    
    if (!data) return 0;
    
    const usage: DailyUsage = JSON.parse(data);
    return usage.counts[modelId] || 0;
  } catch (e) {
    console.error('Failed to get daily usage', e);
    return 0;
  }
};

export const incrementUsage = (modelId: string): boolean => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `${USAGE_KEY_PREFIX}${today}`;
    const data = localStorage.getItem(key);
    
    let usage: DailyUsage;
    if (data) {
      usage = JSON.parse(data);
      // 如果日期不匹配，重置
      if (usage.date !== today) {
        usage = { date: today, counts: {} };
      }
    } else {
      usage = { date: today, counts: {} };
    }
    
    usage.counts[modelId] = (usage.counts[modelId] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(usage));
    return true;
  } catch (e) {
    console.error('Failed to increment usage', e);
    return false;
  }
};

export const canUseModel = (modelId: string): boolean => {
  const model = MODELS.find(m => m.id === modelId);
  if (!model) return false;
  
  const used = getDailyUsage(modelId);
  return used < model.dailyLimit;
};

export const getRemainingUsage = (modelId: string): number => {
  const model = MODELS.find(m => m.id === modelId);
  if (!model) return 0;
  
  const used = getDailyUsage(modelId);
  return Math.max(0, model.dailyLimit - used);
};

// API call
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const getApiKey = (): string => {
  // Try to get from localStorage first
  const savedKey = localStorage.getItem('ai_api_key');
  if (savedKey) {
    return savedKey;
  }
  
  // Fallback to default key
  return DEFAULT_API_KEY;
};

export const callChatAPI = async (
  modelId: string,
  messages: ChatMessage[],
  apiKey?: string
): Promise<string> => {
  const finalApiKey = apiKey || getApiKey();
  const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '抱歉，没有收到回复。';
};


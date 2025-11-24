import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Loader2, ChevronDown, Zap, MessageSquare } from 'lucide-react';
import { 
  MODELS, 
  ModelConfig, 
  callChatAPI, 
  canUseModel, 
  getRemainingUsage, 
  incrementUsage,
  getApiKey
} from '../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelId?: string;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(MODELS[MODELS.length - 1]); // 默认使用最后一个（通常是基础模型）
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close model selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    };

    if (showModelSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelSelector]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check if model can be used
    if (!canUseModel(selectedModel.id)) {
      setError(`今日 ${selectedModel.name} 的使用次数已用完（${selectedModel.dailyLimit}次/天）`);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history
      const conversationHistory = messages
        .slice(-10) // Keep last 10 messages as context
        .map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: userMessage.content,
      });

      const response = await callChatAPI(selectedModel.id, conversationHistory);

      // Increment usage
      incrementUsage(selectedModel.id);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        modelId: selectedModel.id,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      setError(err.message || '发送消息失败，请稍后重试。');
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `抱歉，我遇到了一些问题：${err.message || '未知错误'}`,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  const handleModelSelect = (model: ModelConfig) => {
    setSelectedModel(model);
    setShowModelSelector(false);
  };

  const remainingUsage = getRemainingUsage(selectedModel.id);
  const usagePercentage = (selectedModel.dailyLimit - remainingUsage) / selectedModel.dailyLimit * 100;

  // Navily Logo Component (smaller version with unique IDs to avoid conflicts)
  const NavilyLogoSmall = () => (
    <svg width="" height="16" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
      <defs>
        <filter id="shadow-chat" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35"/>
        </filter>

        <linearGradient id="grad-left-chat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#515151"/>
          <stop offset="40%" stopColor="#2B2B2B"/>
          <stop offset="70%" stopColor="#1A1A1A"/>
          <stop offset="100%" stopColor="#050505"/>
        </linearGradient>

        <linearGradient id="grad-mid-chat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="25%" stopColor="#EDEDED"/>
          <stop offset="55%" stopColor="#B2B2B2"/>
          <stop offset="80%" stopColor="#7A7A7A"/>
          <stop offset="100%" stopColor="#505050"/>
        </linearGradient>

        <linearGradient id="grad-right-chat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DCDCDC"/>
          <stop offset="40%" stopColor="#A6A6A6"/>
          <stop offset="80%" stopColor="#6B6B6B"/>
          <stop offset="100%" stopColor="#3A3A3A"/>
        </linearGradient>

        <linearGradient id="grad-edge-chat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
          <stop offset="40%" stopColor="#F4F4F4" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#CFCFCF" stopOpacity="0.2"/>
        </linearGradient>
      </defs>

      <g filter="url(#shadow-chat)" transform="translate(24,12)">
        <path
          d="M40 32 H92 C98 32 102 36 102 42 V212 C102 218 98 222 92 222 H40 C34 222 30 218 30 212 V42 C30 36 34 32 40 32 Z"
          fill="url(#grad-left-chat)"
        />
        <path
          d="M102 32 H150 C156 32 160 36 158 42 L128 222 C127 228 123 232 117 232 H69 C63 232 59 228 60 222 L92 42 C93 36 97 32 102 32 Z"
          fill="url(#grad-mid-chat)"
        />
        <path
          d="M150 32 H198 C204 32 208 36 208 42 V212 C208 218 204 222 198 222 H150 C144 222 140 218 140 212 V42 C140 36 144 32 150 32 Z"
          fill="url(#grad-right-chat)"
        />
        <path
          d="M92 42 L60 222"
          stroke="url(#grad-edge-chat)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M150 32 L140 222"
          stroke="url(#grad-edge-chat)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );

  return (
    <div className="bg-[#0F0F0F]/50 border border-white/5 rounded-sm p-5 backdrop-blur-sm flex flex-col min-h-[400px] max-h-[600px] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-white">
        <MessageSquare size={16} />
        <h2 className="text-sm font-bold uppercase tracking-widest">AI Assistant</h2>
      </div>

      {/* Model Selector */}
      <div className="relative mb-4" ref={selectorRef}>
        <button
          onClick={() => setShowModelSelector(!showModelSelector)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-sm text-xs text-navily-silver hover:border-white/20 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>{selectedModel.name}</span>
            <span className="text-[10px] text-navily-muted">剩余 {remainingUsage}/{selectedModel.dailyLimit}</span>
          </div>
          <ChevronDown size={12} className={`transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
        </button>
        
        {showModelSelector && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-sm shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="p-2 space-y-1">
              {/* Premium Models */}
              <div className="px-2 py-1 text-[10px] text-navily-muted uppercase tracking-wider">Premium (5次/天)</div>
              {MODELS.filter(m => m.group === 'premium').map(model => {
                const rem = getRemainingUsage(model.id);
                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-colors ${
                      selectedModel.id === model.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-navily-silver hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{model.name}</span>
                      <span className="text-[10px] text-navily-muted">剩余 {rem}</span>
                    </div>
                  </button>
                );
              })}
              
              {/* Standard Models */}
              <div className="px-2 py-1 text-[10px] text-navily-muted uppercase tracking-wider mt-2">Standard (30次/天)</div>
              {MODELS.filter(m => m.group === 'standard').map(model => {
                const rem = getRemainingUsage(model.id);
                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-colors ${
                      selectedModel.id === model.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-navily-silver hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{model.name}</span>
                      <span className="text-[10px] text-navily-muted">剩余 {rem}</span>
                    </div>
                  </button>
                );
              })}
              
              {/* Basic Models */}
              <div className="px-2 py-1 text-[10px] text-navily-muted uppercase tracking-wider mt-2">Basic (200次/天)</div>
              {MODELS.filter(m => m.group === 'basic').map(model => {
                const rem = getRemainingUsage(model.id);
                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-colors ${
                      selectedModel.id === model.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-navily-silver hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{model.name}</span>
                      <span className="text-[10px] text-navily-muted">剩余 {rem}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Usage Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-white/5 rounded-full h-1">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-[200px] mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="p-4 bg-white/5 rounded-sm mb-4">
              <NavilyLogoSmall />
            </div>
            <p className="text-sm text-navily-muted mb-2">开始与 AI 对话</p>
            <p className="text-xs text-navily-muted/70">当前模型: {selectedModel.name}</p>
            <p className="text-xs text-navily-muted/70 mt-1">剩余次数: {remainingUsage}/{selectedModel.dailyLimit}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <NavilyLogoSmall />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-sm p-3 ${
                  message.role === 'user'
                    ? 'bg-white/10 text-white'
                    : 'bg-[#1A1A1A] border border-white/5 text-navily-silver'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-navily-muted/50">
                    {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {message.modelId && (
                    <p className="text-[10px] text-navily-muted/50">
                      {MODELS.find(m => m.id === message.modelId)?.name}
                    </p>
                  )}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={12} className="text-white" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <NavilyLogoSmall />
            </div>
            <div className="bg-[#1A1A1A] border border-white/5 rounded-sm p-3">
              <Loader2 size={16} className="text-navily-silver animate-spin" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-sm">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <form onSubmit={handleSend}>
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="输入消息..."
              disabled={isLoading || remainingUsage === 0}
              rows={1}
              className="flex-1 bg-[#1A1A1A] border border-white/5 rounded-sm px-3 py-2 text-sm text-white placeholder:text-navily-muted/50 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50 resize-none max-h-32 overflow-y-auto"
              style={{ minHeight: '40px', height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || remainingUsage === 0}
              className="px-4 h-[40px] bg-white text-black rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-gray-200 flex-shrink-0"
              style={{ minHeight: '40px' }}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-navily-muted/50">
            按 Enter 发送，Shift+Enter 换行
          </p>
          {remainingUsage === 0 && (
            <p className="text-[10px] text-red-400">
              今日使用次数已用完
            </p>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-[10px] text-navily-muted hover:text-white transition-colors"
            >
              清空对话
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

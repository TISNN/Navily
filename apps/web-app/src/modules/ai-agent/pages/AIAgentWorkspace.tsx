import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Clock, 
  MoreHorizontal, 
  Paperclip, 
  ArrowUp, 
  Sparkles, 
  Globe, 
  FileText, 
  Video, 
  Layout, 
  Smile, 
  FolderOpen, 
  Image as ImageIcon,
  Zap,
  Bot,
  ChevronRight,
  History
} from 'lucide-react';
import { useAuth } from '@app/hooks/useAuth';
import { aiService } from '@shared/api/aiService';

// 模拟的专家智能体数据
const AGENTS = [
  {
    id: 'landing-page',
    icon: Layout,
    title: 'Landing Page Builder',
    description: 'Professional high-end Landing Page generation tool.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'gif-maker',
    icon: Smile,
    title: 'GIF Sticker Maker',
    description: 'Cute cartoon sticker generator.',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    id: 'tidy-folder',
    icon: FolderOpen,
    title: 'Tidy Folder',
    description: 'Professional folder organization assistant.',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'visual-lab',
    icon: ImageIcon,
    title: 'Visual Lab',
    description: 'Professional visual content generation tool.',
    color: 'bg-purple-100 text-purple-600'
  }
];

// 快捷操作建议
const QUICK_ACTIONS = [
  { icon: Clock, label: '定时任务', color: 'text-yellow-500 bg-yellow-50' },
  { icon: Globe, label: '制作网页', color: 'text-green-500 bg-green-50' },
  { icon: FileText, label: '调研报告', color: 'text-purple-500 bg-purple-50' },
  { icon: Video, label: '视频生成', color: 'text-red-500 bg-red-50' },
];

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIAgentWorkspace() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 构建历史消息上下文
      const historyContext = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // 调用 AI 服务
      const response = await aiService.sendMessage(inputValue, historyContext);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.text,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，我现在遇到了一些问题，请稍后再试。',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900 font-sans">
      {/* 左侧对话导航栏 */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col">
        {/* 新建任务按钮 */}
        <div className="p-4">
          <button 
            onClick={() => setMessages([])}
            className="w-full flex items-center gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl transition-colors font-medium text-sm group"
          >
            <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            新建任务
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索" 
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-200"
            />
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-6">
          {/* 专家部分 */}
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-gray-400">专家</div>
            <div className="space-y-0.5">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Bot className="w-4 h-4" />
                <span>探索专家</span>
                <span className="ml-auto text-[10px] bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded text-gray-500">New</span>
              </button>
            </div>
          </div>

          {/* 任务记录 */}
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-gray-400">任务记录</div>
            {messages.length > 0 ? (
              <div className="space-y-0.5">
                 <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                  <MessageSquare className="w-4 h-4" />
                  <span className="truncate">当前对话</span>
                </button>
              </div>
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-gray-400">没有任务记录</p>
              </div>
            )}
          </div>
        </nav>
        
        {/* 底部用户信息区域 */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
           {/* 这里可以放一些底部操作，比如设置或者回收站 */}
           <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
             <History className="w-3.5 h-3.5" />
             查看历史归档
           </button>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        
        {messages.length === 0 ? (
          // 空状态 - 首页视图
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto pt-20">
              {/* 问候语 */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12 tracking-tight">
                {getGreeting()}，有什么可以帮忙的？
              </h1>

              {/* 中央输入框 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8 relative group focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入任务，然后交给小IN Agent"
                  className="w-full h-24 bg-transparent resize-none focus:outline-none text-gray-700 dark:text-gray-200 text-base placeholder:text-gray-400"
                />
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                       <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <span className="text-xs text-gray-400 font-medium">Auto</span>
                     <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <Zap className="w-4 h-4" />
                     </button>
                     <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          inputValue.trim() 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUp className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              </div>

              {/* 快捷操作区 */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                {QUICK_ACTIONS.map((action, index) => (
                  <button 
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full shadow-sm hover:shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    <span className={`p-1 rounded-full ${action.color.replace('text-', 'bg-opacity-20 ')}`}>
                       <action.icon className={`w-3.5 h-3.5 ${action.color.split(' ')[0]}`} />
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{action.label}</span>
                  </button>
                ))}
                <button className="text-sm text-gray-400 hover:text-gray-600 px-2">更多</button>
              </div>

              {/* 专家/工具卡片区 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">推荐专家</h2>
                  <button className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1">
                    显示更多 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {AGENTS.map((agent) => (
                    <div 
                      key={agent.id}
                      className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg ${agent.color} flex items-center justify-center`}>
                          <agent.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                        {agent.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {agent.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 对话视图
          <>
             {/* 消息列表 */}
             <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200">
               <div className="max-w-3xl mx-auto space-y-6">
                 {messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                       msg.type === 'user' 
                         ? 'bg-blue-600 text-white shadow-md' 
                         : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700'
                     }`}>
                       {msg.content}
                     </div>
                   </div>
                 ))}
                 {isTyping && (
                   <div className="flex justify-start">
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                       <div className="flex gap-1.5">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                       </div>
                     </div>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>
             </div>

             {/* 底部输入框 */}
             <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
               <div className="max-w-3xl mx-auto relative">
                 <input
                   type="text"
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="请输入消息..."
                   className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700 dark:text-gray-200"
                 />
                 <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      inputValue.trim() 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                 </button>
               </div>
             </div>
          </>
        )}
      </main>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

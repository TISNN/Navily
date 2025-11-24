import React, { useState, useEffect } from 'react';
import { Bookmark } from '../types';
import { analyzeUrlWithGemini } from '../services/geminiService';
import { X, Sparkles, Loader2, Save, Link2 } from 'lucide-react';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  existingBookmark?: Bookmark | null;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({ isOpen, onClose, onSave, existingBookmark }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('🔖');
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingBookmark) {
      setUrl(existingBookmark.url);
      setTitle(existingBookmark.title);
      setDescription(existingBookmark.description);
      setCategory(existingBookmark.category);
      setIcon(existingBookmark.icon);
      setIsFavorite(existingBookmark.isFavorite);
    } else {
      resetForm();
    }
  }, [existingBookmark, isOpen]);

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setCategory('');
    setIcon('🔖');
    setIsFavorite(false);
    setError('');
  };

  const handleAutoFill = async () => {
    if (!url) {
      setError('Please enter a URL first');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeUrlWithGemini(url);
      setTitle(result.title);
      setDescription(result.description);
      setCategory(result.category);
      setIcon(result.icon);
    } catch (e) {
      setError('Failed to analyze URL. Please fill manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      url,
      title: title || url,
      description,
      category: category || 'Uncategorized',
      icon,
      isFavorite
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0f0f0f]">
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">
            {existingBookmark ? 'Edit Coordinates' : 'New Destination'}
          </h2>
          <button onClick={onClose} className="text-navily-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-[#050505]">
          <form id="bookmark-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* URL Input with AI Button */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navily-muted uppercase tracking-wider">Target URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 size={16} className="text-navily-muted group-focus-within:text-white" />
                  </div>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-[#121212] border border-white/10 rounded-sm py-3 pl-10 pr-4 text-white placeholder-neutral-700 focus:outline-none focus:border-white/30 focus:bg-[#1a1a1a] transition-all font-mono text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={isAnalyzing || !url}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-sm font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isAnalyzing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span className="hidden sm:inline">ANALYZE</span>
                </button>
              </div>
              {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
            </div>

            {/* Title & Icon */}
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-navily-muted uppercase tracking-wider">Identifier</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-[#1a1a1a] transition-all"
                  placeholder="Site Name"
                />
              </div>
              <div className="space-y-2 w-20">
                <label className="block text-xs font-bold text-navily-muted uppercase tracking-wider">Symbol</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-sm px-4 py-3 text-center text-xl focus:outline-none focus:border-white/30 focus:bg-[#1a1a1a] transition-all"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navily-muted uppercase tracking-wider">Intel</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#121212] border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-[#1a1a1a] transition-all resize-none font-light"
                placeholder="Brief summary..."
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navily-muted uppercase tracking-wider">Sector</label>
              <input
                type="text"
                list="categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-[#1a1a1a] transition-all"
                placeholder="e.g. Development"
              />
              <datalist id="categories">
                <option value="Development" />
                <option value="Design" />
                <option value="News" />
                <option value="Finance" />
                <option value="Research" />
                <option value="Tools" />
              </datalist>
            </div>
            
             <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="fav" 
                  checked={isFavorite} 
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-5 h-5 rounded-sm border-white/20 text-white focus:ring-0 bg-[#121212]"
                />
                <label htmlFor="fav" className="text-sm font-medium text-navily-silver">Mark as Priority</label>
             </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/5 bg-[#0f0f0f] flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-navily-muted hover:text-white hover:bg-white/5 rounded-sm transition-colors text-sm font-bold uppercase tracking-wider"
          >
            Abort
          </button>
          <button
            type="submit"
            form="bookmark-form"
            className="px-8 py-2 bg-white text-black hover:bg-gray-200 rounded-sm font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-white/5"
          >
            <Save size={16} />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
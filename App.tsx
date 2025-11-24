
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, useDroppable, pointerWithin, rectIntersection, CollisionDetection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Bookmark, ViewMode, ToastMessage, ToastType, Todo } from './types';
import { getBookmarks, saveBookmarks, getTodos, saveTodos, getLayout, saveLayout, ModuleLayout } from './services/storageService';
import { BookmarksModule } from './components/BookmarksModule';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';
import { WelcomeWidget } from './components/WelcomeWidget';
import { FocusTimer } from './components/FocusTimer';
import { DailyNotes } from './components/DailyNotes';
import { AIChat } from './components/AIChat';
import { DraggableModule } from './components/DraggableModule';
import {
  Plus,
  Search,
  Settings,
  Download,
  Upload,
  CheckSquare,
  Layout,
  Trash2,
  List,
  LayoutGrid
} from 'lucide-react';

const NavilyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 drop-shadow-2xl">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity="0.35" />
      </filter>

      <linearGradient id="grad-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#515151" />
        <stop offset="40%" stopColor="#2B2B2B" />
        <stop offset="70%" stopColor="#1A1A1A" />
        <stop offset="100%" stopColor="#050505" />
      </linearGradient>

      <linearGradient id="grad-mid" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="25%" stopColor="#EDEDED" />
        <stop offset="55%" stopColor="#B2B2B2" />
        <stop offset="80%" stopColor="#7A7A7A" />
        <stop offset="100%" stopColor="#505050" />
      </linearGradient>

      <linearGradient id="grad-right" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#DCDCDC" />
        <stop offset="40%" stopColor="#A6A6A6" />
        <stop offset="80%" stopColor="#6B6B6B" />
        <stop offset="100%" stopColor="#3A3A3A" />
      </linearGradient>

      <linearGradient id="grad-edge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
        <stop offset="40%" stopColor="#F4F4F4" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#CFCFCF" stopOpacity="0.2" />
      </linearGradient>
    </defs>

    <g filter="url(#shadow)" transform="translate(24,12)">
      <path
        d="M40 32 H92 C98 32 102 36 102 42 V212 C102 218 98 222 92 222 H40 C34 222 30 218 30 212 V42 C30 36 34 32 40 32 Z"
        fill="url(#grad-left)"
      />
      <path
        d="M102 32 H150 C156 32 160 36 158 42 L128 222 C127 228 123 232 117 232 H69 C63 232 59 228 60 222 L92 42 C93 36 97 32 102 32 Z"
        fill="url(#grad-mid)"
      />
      <path
        d="M150 32 H198 C204 32 208 36 208 42 V212 C208 218 204 222 198 222 H150 C144 222 140 218 140 212 V42 C140 36 144 32 150 32 Z"
        fill="url(#grad-right)"
      />
      <path
        d="M92 42 L60 222"
        stroke="url(#grad-edge)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M150 32 L140 222"
        stroke="url(#grad-edge)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  // Custom collision detection: prioritize droppable areas (like middle-column) over sortable items
  const customCollisionDetection: CollisionDetection = (args) => {
    // First, check for pointer-based collisions with droppable containers
    const pointerCollisions = pointerWithin(args);

    // Filter for droppable containers (like 'middle-column')
    const droppableCollisions = pointerCollisions.filter(collision => {
      const id = collision.id as string;
      return id === 'middle-column' || id === 'left-column' || id === 'right-column';
    });

    // If we found a droppable container, prefer it
    if (droppableCollisions.length > 0) {
      return droppableCollisions;
    }

    // Otherwise, fall back to rect intersection for sortable items
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    // Final fallback to closest center
    return closestCenter(args);
  };

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');

  // Todo Input State
  const [newTodo, setNewTodo] = useState('');

  // Layout state
  const [moduleLayout, setModuleLayout] = useState<ModuleLayout>(getLayout());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedBookmarkId, setDraggedBookmarkId] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    setBookmarks(getBookmarks());
    setTodos(getTodos());
    const layout = getLayout();
    setModuleLayout(layout);
    // Debug: log layout to see if bookmarks is in it
    console.log('Loaded layout:', layout);
  }, []);

  // Save data on change
  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    saveLayout(moduleLayout);
  }, [moduleLayout]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Derived Data ---
  const categories = useMemo(() => {
    const cats = new Set(bookmarks.map(b => b.category));
    return ['All', 'Work', 'Study', 'Life', 'Tools', ...Array.from(cats)].filter((v, i, a) => a.indexOf(v) === i); // Unique
  }, [bookmarks]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    bookmarks.forEach(b => b.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [bookmarks]);

  const recentBookmarks = useMemo(() => {
    return [...bookmarks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [bookmarks]);

  const pinnedTools = useMemo(() => {
    return bookmarks.filter(b => b.category === 'Tools' || b.category === 'Productivity').slice(0, 8); // Increased limit slightly
  }, [bookmarks]);

  const favoriteBookmarks = useMemo(() => {
    return bookmarks.filter(b => b.isFavorite).slice(0, 5);
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === 'All' || b.category === activeTab || (activeTab === 'Custom' && !['Work', 'Study', 'Life'].includes(b.category));

      return matchesSearch && matchesTab;
    });
  }, [bookmarks, searchQuery, activeTab]);

  // --- Handlers ---

  const handleSaveBookmark = (bookmarkData: Omit<Bookmark, 'id' | 'createdAt'>) => {
    if (editingBookmark) {
      setBookmarks(prev => prev.map(b =>
        b.id === editingBookmark.id ? { ...b, ...bookmarkData } : b
      ));
      addToast("Coordinates updated successfully.");
    } else {
      const newBookmark: Bookmark = {
        ...bookmarkData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setBookmarks(prev => [newBookmark, ...prev]);
      addToast("New destination added to chart.");
    }
    setEditingBookmark(null);
  };

  const handleDeleteBookmark = (id: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      setBookmarks(prev => prev.filter(b => b.id !== id));
      addToast("Destination removed from chart.", "info");
    }
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsModalOpen(true);
  };

  const handleToggleFavorite = (id: string) => {
    setBookmarks(prev => prev.map(b => {
      if (b.id === id) {
        const newVal = !b.isFavorite;
        addToast(newVal ? "Marked as priority." : "Removed from priority.", "info");
        return { ...b, isFavorite: newVal };
      }
      return b;
    }));
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard.", "success");
  };

  // Todo Handlers
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const todo: Todo = { id: crypto.randomUUID(), text: newTodo, completed: false, createdAt: Date.now() };
    setTodos([todo, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // Import/Export
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `navily_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setIsSettingsOpen(false);
    addToast("Database exported successfully.");
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
    setIsSettingsOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setBookmarks(json);
          addToast("Database restored successfully.", "success");
        } else {
          addToast("Invalid backup file.", "error");
        }
      } catch (err) {
        addToast("Failed to parse backup file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    const closeSettings = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#settings-menu')) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('click', closeSettings);
    }
    return () => document.removeEventListener('click', closeSettings);
  }, [isSettingsOpen]);

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;

    // Check if it's a bookmark or a module
    const isBookmark = bookmarks.some(b => b.id === id);
    if (isBookmark) {
      setDraggedBookmarkId(id);
    } else {
      setActiveId(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;

    // Check if it's a bookmark drag
    const isBookmark = bookmarks.some(b => b.id === activeId);

    if (isBookmark) {
      setDraggedBookmarkId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = filteredBookmarks.findIndex(b => b.id === activeId);
      const newIndex = filteredBookmarks.findIndex(b => b.id === (over.id as string));

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder bookmarks
        const newBookmarks = arrayMove(filteredBookmarks, oldIndex, newIndex);

        // Update the full bookmarks array maintaining the new order
        const bookmarkIds = newBookmarks.map((b: Bookmark) => b.id);
        const reorderedBookmarks = bookmarkIds.map((id: string) =>
          bookmarks.find(b => b.id === id)!
        ).filter(Boolean);

        // Keep bookmarks that weren't in filtered list at the end
        const otherBookmarks = bookmarks.filter(b => !bookmarkIds.includes(b.id));
        setBookmarks([...reorderedBookmarks, ...otherBookmarks]);
        addToast("书签顺序已更新", "success");
      }
    } else {
      // Module drag logic
      setActiveId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const overId = over.id as string;

      setModuleLayout((prevLayout) => {
        const newLayout = { ...prevLayout };

        // Ensure middle array exists (for backward compatibility)
        if (!newLayout.middle) {
          newLayout.middle = [];
        }

        // Find which column contains the active item
        const leftIndex = prevLayout.left.indexOf(activeId);
        const middleIndex = prevLayout.middle?.indexOf(activeId) ?? -1;
        const rightIndex = prevLayout.right.indexOf(activeId);

        // Check if over is the middle column drop zone
        const isOverMiddleColumn = overId === 'middle-column';

        // Find which column contains the over item
        const overLeftIndex = prevLayout.left.indexOf(overId);
        const overMiddleIndex = prevLayout.middle?.indexOf(overId) ?? -1;
        const overRightIndex = prevLayout.right.indexOf(overId);

        // Determine source and target columns
        let sourceColumn: 'left' | 'middle' | 'right' | null = null;
        let targetColumn: 'left' | 'middle' | 'right' | null = null;

        if (leftIndex !== -1) sourceColumn = 'left';
        else if (middleIndex !== -1) sourceColumn = 'middle';
        else if (rightIndex !== -1) sourceColumn = 'right';

        // Handle middle column drop zone
        if (isOverMiddleColumn) {
          targetColumn = 'middle';
        } else if (overLeftIndex !== -1) {
          targetColumn = 'left';
        } else if (overMiddleIndex !== -1) {
          targetColumn = 'middle';
        } else if (overRightIndex !== -1) {
          targetColumn = 'right';
        }

        if (!sourceColumn || !targetColumn) {
          return newLayout;
        }

        // If dragging within the same column
        if (sourceColumn === targetColumn) {
          const items = [...newLayout[sourceColumn]];
          const sourceIndex = sourceColumn === 'left' ? leftIndex : sourceColumn === 'middle' ? middleIndex : rightIndex;
          const targetIndex = sourceColumn === 'left' ? overLeftIndex : sourceColumn === 'middle' ? overMiddleIndex : overRightIndex;
          const [removed] = items.splice(sourceIndex, 1);
          items.splice(targetIndex, 0, removed);
          newLayout[sourceColumn] = items;
        } else {
          // Dragging between different columns
          const sourceItems = [...newLayout[sourceColumn]];
          const targetItems = [...newLayout[targetColumn]];

          const sourceIndex = sourceColumn === 'left' ? leftIndex : sourceColumn === 'middle' ? middleIndex : rightIndex;

          // If dropping on middle column drop zone (empty), append to end
          let targetIndex: number;
          if (isOverMiddleColumn) {
            targetIndex = targetItems.length; // Append to end
          } else {
            targetIndex = targetColumn === 'left' ? overLeftIndex : targetColumn === 'middle' ? overMiddleIndex : overRightIndex;
          }

          const [removed] = sourceItems.splice(sourceIndex, 1);
          targetItems.splice(targetIndex, 0, removed);

          newLayout[sourceColumn] = sourceItems;
          newLayout[targetColumn] = targetItems;
        }

        return newLayout;
      });

      addToast("布局已更新", "success");
    }
  };

  // Middle Column Drop Zone Component
  const MiddleColumnDropZone: React.FC<{
    moduleLayout: ModuleLayout;
    renderModule: (moduleId: string) => React.ReactNode;
  }> = ({ moduleLayout, renderModule }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'middle-column',
      data: {
        type: 'column',
        column: 'middle',
      },
    });

    const middleModules = moduleLayout.middle || [];

    return (
      <div
        ref={setNodeRef}
        className={`lg:col-span-6 flex flex-col space-y-8 min-h-[400px] transition-all duration-200 ${isOver ? 'bg-white/5 rounded-sm border-2 border-dashed border-white/20' : ''
          }`}
      >
        {middleModules.length > 0 ? (
          <SortableContext
            items={middleModules}
            strategy={verticalListSortingStrategy}
          >
            {middleModules.map((moduleId) => (
              <DraggableModule key={moduleId} id={moduleId} className="flex-shrink-0">
                <div className="w-full">
                  {renderModule(moduleId)}
                </div>
              </DraggableModule>
            ))}
          </SortableContext>
        ) : (
          <div className={`flex-1 flex items-center justify-center border-2 border-dashed rounded-sm min-h-[400px] transition-all duration-200 ${isOver ? 'border-white/30 bg-white/5' : 'border-white/10'
            }`}>
            <p className={`text-sm transition-colors ${isOver ? 'text-white' : 'text-navily-muted'
              }`}>拖拽模块到这里</p>
          </div>
        )}
      </div>
    );
  };

  // Module renderer
  const renderModule = (moduleId: string) => {
    switch (moduleId) {
      case 'welcome':
        return <WelcomeWidget />;
      case 'timer':
        return <FocusTimer />;
      case 'today':
        return (
          <div className="bg-[#0F0F0F]/50 border border-white/5 rounded-sm p-5 backdrop-blur-sm flex-1">
            <div className="flex items-center gap-2 mb-4 text-white">
              <CheckSquare size={16} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Today</h2>
            </div>

            {/* Todo List */}
            <div className="space-y-2 mb-4">
              {todos.map(todo => (
                <div key={todo.id} className="group flex items-center gap-3 text-sm group">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${todo.completed ? 'bg-white/20 border-transparent text-white' : 'border-white/20 hover:border-white/40'}`}
                  >
                    {todo.completed && <Plus size={10} className="rotate-45" />}
                  </button>
                  <span className={`flex-1 truncate ${todo.completed ? 'line-through text-navily-muted' : 'text-navily-silver'}`}>
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-navily-muted hover:text-red-400 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addTodo} className="relative">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="+ Add task"
                className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-white placeholder:text-navily-muted/50 focus:outline-none focus:border-white/30 transition-colors"
              />
            </form>

            {/* Fixed Daily Links (Favorites) */}
            {favoriteBookmarks.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-navily-muted mb-3">Quick Access</p>
                <div className="space-y-2">
                  {favoriteBookmarks.map(bm => (
                    <a key={bm.id} href={bm.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                      <span className="w-6 h-6 flex items-center justify-center bg-[#1A1A1A] rounded-sm text-xs border border-white/5 group-hover:border-white/20 transition-colors">
                        {bm.icon}
                      </span>
                      <span className="text-sm text-navily-silver group-hover:text-white transition-colors truncate">{bm.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'pinned':
        return (
          <div className="bg-[#0F0F0F]/50 border border-white/5 rounded-sm p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 text-white">
              <Layout size={16} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Pinned Tools</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {pinnedTools.map(tool => (
                <a
                  key={tool.id}
                  href={tool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square flex flex-col items-center justify-center bg-[#1A1A1A] hover:bg-white/5 border border-white/5 hover:border-white/20 rounded-sm transition-all group"
                  title={tool.title}
                >
                  <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all">{tool.icon}</span>
                </a>
              ))}
              {pinnedTools.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#121212] rounded-sm border border-white/5 opacity-50"></div>
              ))}
            </div>
          </div>
        );
      case 'chat':
        return <AIChat />;
      case 'bookmarks':
        return (
          <div className="flex-1 w-full">
            <BookmarksModule
              bookmarks={filteredBookmarks}
              viewMode={viewMode}
              activeTab={activeTab}
              onViewModeChange={setViewMode}
              onTabChange={setActiveTab}
              onEdit={handleEditBookmark}
              onDelete={handleDeleteBookmark}
              onToggleFavorite={handleToggleFavorite}
              onCopyUrl={handleCopyUrl}
              onAddNew={() => { setEditingBookmark(null); setIsModalOpen(true); }}
            />
          </div>
        );
      case 'notes':
        return <DailyNotes />;
      case 'tags':
        return (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <div className="w-1 h-4 bg-white/50 rounded-full"></div>
              Signal Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 12).map(tag => (
                <span key={tag} className="px-3 py-1 bg-[#1A1A1A] border border-white/5 text-navily-muted text-xs rounded-full hover:border-white/30 hover:text-white cursor-default transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        );
      case 'collections':
        return (
          <div className="space-y-2 pt-4 border-t border-white/5">
            {categories.filter(c => c !== 'All').slice(0, 3).map(cat => {
              const count = bookmarks.filter(b => b.category === cat).length;
              return (
                <div key={cat} onClick={() => setActiveTab(cat)} className="flex items-center justify-between text-xs text-navily-muted hover:text-white cursor-pointer group">
                  <span>{cat}</span>
                  <span className="font-mono opacity-50 group-hover:opacity-100">{count}</span>
                </div>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-navily-bg text-navily-silver font-sans selection:bg-white/20 selection:text-white overflow-x-hidden flex flex-col">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-white/5 to-transparent opacity-50" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-bl from-gray-800/10 to-transparent rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20" />
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-8 py-8 flex-1 flex flex-col">

        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-500">
              <NavilyLogo />
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-sans leading-none">Navily</h1>
              <p className="text-navily-muted text-[10px] tracking-[0.2em] uppercase font-bold mt-1">System Active</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group w-64 hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navily-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH SYSTEM..."
                className="w-full bg-[#0F0F0F] border border-white/5 rounded-full py-2 pl-9 pr-4 text-xs font-mono text-white focus:border-white/20 focus:outline-none transition-all placeholder:text-navily-muted/50"
              />
            </div>

            <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

            <button
              onClick={() => { setEditingBookmark(null); setIsModalOpen(true); }}
              className="px-5 py-2 bg-white text-black rounded-sm font-bold text-xs tracking-wider uppercase hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <Plus size={14} strokeWidth={3} />
              Add New
            </button>

            <div className="relative" id="settings-menu">
              <button
                onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
                className="p-2 text-navily-muted hover:text-white transition-colors"
              >
                <Settings size={20} />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-sm shadow-2xl z-50 overflow-hidden text-sm animate-slide-up">
                  <button onClick={handleExport} className="w-full text-left px-4 py-3 text-navily-silver hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors text-xs uppercase tracking-wider">
                    <Download size={14} /> Export Data
                  </button>
                  <button onClick={triggerImport} className="w-full text-left px-4 py-3 text-navily-silver hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors text-xs uppercase tracking-wider">
                    <Upload size={14} /> Import Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <DndContext
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

            {/* --- LEFT COLUMN: TODAY & QUICK ACCESS & TIMER --- */}
            <div className="lg:col-span-3 space-y-8 flex flex-col">
              <SortableContext items={moduleLayout.left} strategy={verticalListSortingStrategy}>
                {moduleLayout.left.map((moduleId) => (
                  <DraggableModule key={moduleId} id={moduleId}>
                    {renderModule(moduleId)}
                  </DraggableModule>
                ))}
              </SortableContext>
            </div>

            {/* --- MIDDLE COLUMN: ALL MODULES (Adaptive) --- */}
            <MiddleColumnDropZone
              moduleLayout={moduleLayout}
              renderModule={renderModule}
            />

            {/* --- RIGHT COLUMN: DAILY NOTES (Dominant) & TAGS --- */}
            <div className="lg:col-span-3 space-y-8 flex flex-col h-full">
              <SortableContext items={moduleLayout.right} strategy={verticalListSortingStrategy}>
                {moduleLayout.right.map((moduleId) => (
                  <DraggableModule key={moduleId} id={moduleId}>
                    {renderModule(moduleId)}
                  </DraggableModule>
                ))}
              </SortableContext>
            </div>

          </div>
        </DndContext>

        <Footer />

      </div>

      <AddBookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBookmark}
        existingBookmark={editingBookmark}
      />
    </div>
  );
};

export default App;

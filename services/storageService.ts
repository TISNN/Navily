
import { Bookmark, Todo, Note } from '../types';

const BOOKMARK_KEY = 'navily_bookmarks_v2';
const TODO_KEY = 'navily_todos_v1';
const NOTE_KEY = 'navily_notes_v1';
const LAYOUT_KEY = 'navily_layout_v1';

// Initial dummy data to populate the app if empty
const INITIAL_DATA: Bookmark[] = [
  {
    id: '1',
    url: 'https://github.com',
    title: 'GitHub',
    description: 'Where the world builds software. Code hosting and collaboration.',
    category: 'Work',
    tags: ['code', 'git', 'collaboration'],
    icon: '🐙',
    createdAt: Date.now(),
    isFavorite: true,
  },
  {
    id: '2',
    url: 'https://dribbble.com',
    title: 'Dribbble',
    description: 'Design inspiration and community for creatives.',
    category: 'Design',
    tags: ['inspiration', 'ui', 'art'],
    icon: '🎨',
    createdAt: Date.now() - 100000,
    isFavorite: false,
  },
  {
    id: '3',
    url: 'https://news.ycombinator.com',
    title: 'Hacker News',
    description: 'Cybersecurity, startup, and tech news aggregator.',
    category: 'News',
    tags: ['tech', 'startup', 'reading'],
    icon: '📰',
    createdAt: Date.now() - 200000,
    isFavorite: true,
  },
  {
    id: '4',
    url: 'https://react.dev',
    title: 'React',
    description: 'The library for web and native user interfaces.',
    category: 'Development',
    tags: ['frontend', 'js', 'docs'],
    icon: '⚛️',
    createdAt: Date.now() - 300000,
    isFavorite: false,
  },
  {
    id: '5',
    url: 'https://figma.com',
    title: 'Figma',
    description: 'Collaborative interface design tool.',
    category: 'Tools',
    tags: ['design', 'ui', 'vector'],
    icon: '🖌️',
    createdAt: Date.now() - 400000,
    isFavorite: true,
  },
  {
    id: '6',
    url: 'https://notion.so',
    title: 'Notion',
    description: 'All-in-one workspace for notes and tasks.',
    category: 'Tools',
    tags: ['productivity', 'notes', 'wiki'],
    icon: '📓',
    createdAt: Date.now() - 500000,
    isFavorite: true,
  }
];

const INITIAL_TODOS: Todo[] = [
  { id: '1', text: 'Check analytics report', completed: false, createdAt: Date.now() },
  { id: '2', text: 'Review PR #42', completed: true, createdAt: Date.now() - 10000 },
];

const INITIAL_NOTES: Note[] = [
  { 
    id: '1', 
    content: '# Project Idea\nThinking about a decentralized file storage system using IPFS.', 
    createdAt: Date.now() 
  },
  { 
    id: '2', 
    content: '- [ ] Buy coffee beans\n- [ ] Clean the mechanical keyboard\n- [ ] Update BIOS', 
    createdAt: Date.now() - 86400000 
  }
];

export const getBookmarks = (): Bookmark[] => {
  try {
    const data = localStorage.getItem(BOOKMARK_KEY);
    return data ? JSON.parse(data) : INITIAL_DATA;
  } catch (e) {
    console.error("Failed to load bookmarks", e);
    return [];
  }
};

export const saveBookmarks = (bookmarks: Bookmark[]): void => {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error("Failed to save bookmarks", e);
  }
};

export const getTodos = (): Todo[] => {
  try {
    const data = localStorage.getItem(TODO_KEY);
    return data ? JSON.parse(data) : INITIAL_TODOS;
  } catch (e) {
    console.error("Failed to load todos", e);
    return [];
  }
};

export const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error("Failed to save todos", e);
  }
};

export const getNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(NOTE_KEY);
    return data ? JSON.parse(data) : INITIAL_NOTES;
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save notes", e);
  }
};

// Layout management
export interface ModuleLayout {
  left: string[];
  middle: string[];
  right: string[];
}

const DEFAULT_LAYOUT: ModuleLayout = {
  left: ['welcome', 'timer', 'today', 'pinned'],
  middle: ['bookmarks'],
  right: ['chat', 'notes', 'tags', 'collections'],
};

// Helper function to get all module IDs from layout
export const getAllModuleIds = (layout: ModuleLayout): string[] => {
  return [...layout.left, ...layout.middle, ...layout.right];
};

export const getLayout = (): ModuleLayout => {
  try {
    const data = localStorage.getItem(LAYOUT_KEY);
    if (data) {
      const savedLayout = JSON.parse(data) as ModuleLayout;
      
      // 兼容旧布局（没有 middle 字段）
      if (!savedLayout.middle) {
        savedLayout.middle = [];
        // 如果 bookmarks 在 left 或 right，移到 middle
        if (savedLayout.left.includes('bookmarks')) {
          savedLayout.left = savedLayout.left.filter(id => id !== 'bookmarks');
          savedLayout.middle.push('bookmarks');
        } else if (savedLayout.right.includes('bookmarks')) {
          savedLayout.right = savedLayout.right.filter(id => id !== 'bookmarks');
          savedLayout.middle.push('bookmarks');
        } else {
          savedLayout.middle.push('bookmarks');
        }
      }
      
      // 如果保存的布局中没有 'chat' 模块，添加它
      if (!savedLayout.right.includes('chat') && !savedLayout.left.includes('chat') && !savedLayout.middle.includes('chat')) {
        savedLayout.right.unshift('chat');
      }
      
      return savedLayout;
    }
    return DEFAULT_LAYOUT;
  } catch (e) {
    console.error("Failed to load layout", e);
    return DEFAULT_LAYOUT;
  }
};

export const saveLayout = (layout: ModuleLayout): void => {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch (e) {
    console.error("Failed to save layout", e);
  }
};

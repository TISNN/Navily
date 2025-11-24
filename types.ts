
export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  icon: string; // Emoji character
  createdAt: number;
  isFavorite: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  content: string; // Markdown supported
  createdAt: number;
}

export type ViewMode = 'grid' | 'list';

export interface AIAnalysisResult {
  title: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

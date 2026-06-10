export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  module: string;
  due_date: string; // YYYY-MM-DD format
  priority: TaskPriority;
  notes: string;
  completed: boolean;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO date string
}

export interface ThemeAccent {
  name: string;
  primary: string; // Hex color for active buttons, borders, etc.
  secondary: string; // Hex color for badges or minor highlights
  light: string; // Light background tint for cards
}

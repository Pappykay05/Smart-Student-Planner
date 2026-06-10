import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task, QuickNote } from '../types';

interface AppContextProps {
  user: User | null;
  onboarded: boolean;
  tasks: Task[];
  quickNotes: QuickNote[];
  themeColor: string;
  loading: boolean;
  login: (name: string, email: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  editTask: (id: string, updatedFields: Partial<Omit<Task, 'id'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  addQuickNote: (title: string, content: string) => Promise<void>;
  deleteQuickNote: (id: string) => Promise<void>;
  setThemeColor: (color: string) => Promise<void>;
  resetApp: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  USER: '@ssp_user',
  ONBOARDED: '@ssp_onboarded',
  TASKS: '@ssp_tasks',
  NOTES: '@ssp_notes',
  THEME_COLOR: '@ssp_theme_color',
};

// Default theme accent (Indigo/Lavender)
const DEFAULT_THEME_COLOR = '#6366F1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [themeColor, setThemeColorState] = useState<string>(DEFAULT_THEME_COLOR);
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedUser, storedOnboarded, storedTasks, storedNotes, storedTheme] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
          AsyncStorage.getItem(STORAGE_KEYS.TASKS),
          AsyncStorage.getItem(STORAGE_KEYS.NOTES),
          AsyncStorage.getItem(STORAGE_KEYS.THEME_COLOR),
        ]);

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedOnboarded) setOnboarded(JSON.parse(storedOnboarded));
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        if (storedNotes) setQuickNotes(JSON.parse(storedNotes));
        if (storedTheme) setThemeColorState(storedTheme);
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const login = async (name: string, email: string) => {
    const loggedUser: User = {
      name,
      email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
    };
    setUser(loggedUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedUser));
  };

  const register = async (name: string, email: string) => {
    await login(name, email);
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  };

  const completeOnboarding = async () => {
    setOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, JSON.stringify(true));
  };

  const addTask = async (taskInput: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...taskInput,
      id: Math.random().toString(36).substring(2, 9),
      completed: false,
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
  };

  const editTask = async (id: string, updatedFields: Partial<Omit<Task, 'id'>>) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updatedFields } : task
    );
    setTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
  };

  const toggleTaskComplete = async (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
  };

  const addQuickNote = async (title: string, content: string) => {
    const newNote: QuickNote = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [newNote, ...quickNotes];
    setQuickNotes(updatedNotes);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
  };

  const deleteQuickNote = async (id: string) => {
    const updatedNotes = quickNotes.filter((note) => note.id !== id);
    setQuickNotes(updatedNotes);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
  };

  const setThemeColor = async (color: string) => {
    setThemeColorState(color);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_COLOR, color);
  };

  const resetApp = async () => {
    setUser(null);
    setOnboarded(false);
    setTasks([]);
    setQuickNotes([]);
    setThemeColorState(DEFAULT_THEME_COLOR);
    await AsyncStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        onboarded,
        tasks,
        quickNotes,
        themeColor,
        loading,
        login,
        register,
        logout,
        completeOnboarding,
        addTask,
        editTask,
        deleteTask,
        toggleTaskComplete,
        addQuickNote,
        deleteQuickNote,
        setThemeColor,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

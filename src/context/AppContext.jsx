import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AppContext = createContext();

const loadFromStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const initialState = {
  suggestions: [],
  recentSearches: [],
  adminUser: loadFromStorage('adminUser', null),
  darkMode: loadFromStorage('darkMode', false),
  toasts: [],
  undoStack: [],
  redoStack: [],
  loading: false,
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload, undoStack: [...state.undoStack, { suggestions: state.suggestions }].slice(-20), redoStack: [] };
    case 'ADD_SUGGESTION':
      return { ...state, suggestions: [...state.suggestions, action.payload], undoStack: [...state.undoStack, { suggestions: state.suggestions }].slice(-20), redoStack: [] };
    case 'UPDATE_SUGGESTION':
      return { ...state, suggestions: state.suggestions.map(s => (s.id === action.payload.id || s._id === action.payload._id) ? action.payload : s) };
    case 'DELETE_SUGGESTION':
      return { ...state, suggestions: state.suggestions.filter(s => s.id !== action.payload && s._id !== action.payload) };
    case 'SET_RECENT':
      return { ...state, recentSearches: action.payload };
    case 'ADD_RECENT':
      const filtered = state.recentSearches.filter(r => r !== action.payload);
      return { ...state, recentSearches: [action.payload, ...filtered].slice(0, 10) };
    case 'CLEAR_RECENT':
      return { ...state, recentSearches: [] };
    case 'LOGIN_ADMIN':
      return { ...state, adminUser: action.payload };
    case 'LOGOUT_ADMIN':
      return { ...state, adminUser: null };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return { ...state, suggestions: prev.suggestions, undoStack: state.undoStack.slice(0, -1), redoStack: [...state.redoStack, { suggestions: state.suggestions }] };
    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return { ...state, suggestions: next.suggestions, redoStack: state.redoStack.slice(0, -1), undoStack: [...state.undoStack, { suggestions: state.suggestions }] };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load data from API (realtime database)
  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [suggestions, recent] = await Promise.all([
        api.getSuggestions(),
        api.getRecent()
      ]);
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
      dispatch({ type: 'SET_RECENT', payload: recent });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Gagal memuat data: ' + err.message, type: 'error' } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.loading) loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [state.loading, loadData]);

  // Persist admin & dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('adminUser', JSON.stringify(state.adminUser));
  }, [state.adminUser]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    const html = document.documentElement;
    if (state.darkMode) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [state.darkMode]);

  return (
    <AppContext.Provider value={{ state, dispatch, loadData }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
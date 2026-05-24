import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.toasts.length === 0) return;
    const timers = state.toasts.map(t =>
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: t.id }), 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [state.toasts, dispatch]);

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3">
      {state.toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
              : 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{toast.message}</p>
          <button onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}>
            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
}
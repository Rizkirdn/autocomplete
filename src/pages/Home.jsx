import AutoComplete from '../components/AutoComplete';
import { Search, Sparkles, Zap, Shield, Brain, Keyboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-800 dark:text-white">
          <Sparkles className="w-6 h-6 text-blue-600" />
          AutoComplete Pro
        </div>
        <a href="/admin" className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium">
          <Shield className="w-4 h-4" />
          Admin Panel
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Cari Apa Saja, <span className="text-blue-600">Instan.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Autocomplete cerdas dengan Trie, Fuzzy Search, Levenshtein Distance, 
          dan manajemen data lengkap.
        </p>
        
        <AutoComplete />

        <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Brain className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trie + Fuzzy Search</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Prefix Tree untuk pencarian cepat O(m) dan Levenshtein Distance untuk toleransi typo.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Keyboard className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Navigasi Keyboard</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Arrow keys, Enter, Escape, dan shortcut Ctrl+K untuk focus instan.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Zap className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Heap & Undo/Redo</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Max Heap untuk ranking dan Stack untuk undo/redo operasi admin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
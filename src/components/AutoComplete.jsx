import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Clock, X, TrendingUp, ArrowUpDown, Sparkles, Command, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';  // ← HARUS ADA
import { Trie } from '../utils/trie';
import { fuzzySearch, didYouMean } from '../utils/levenshtein';

export default function AutoComplete() {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [results, setResults] = useState([]);
  const [didYouMeanText, setDidYouMeanText] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const trie = useMemo(() => {
    const t = new Trie();
    state.suggestions.forEach(item => t.insert(item.text, item));
    return t;
  }, [state.suggestions]);

  const categories = useMemo(() => {
    const cats = new Set(state.suggestions.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, [state.suggestions]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setDidYouMeanText(null);
      return;
    }
    const timer = setTimeout(() => {
      let res = trie.search(query);
      if (activeCategory !== 'All') {
        res = res.filter(item => item.category === activeCategory);
      }
      if (res.length === 0) {
        const maxDist = query.length > 4 ? 3 : query.length > 2 ? 2 : 1;
        let fuzzy = fuzzySearch(query, state.suggestions, maxDist);
        if (activeCategory !== 'All') fuzzy = fuzzy.filter(item => item.category === activeCategory);
        res = fuzzy;
      }
      setResults(res);
      setDidYouMeanText(res.length === 0 ? didYouMean(query, state.suggestions) : null);
      setHighlightedIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, activeCategory, trie, state.suggestions]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = async (text) => {
  setQuery(text);
  setIsOpen(false);
  
  try {
    await api.trackSearch(text); // ← INI PENTING
    await loadData(); // refresh data dari server
  } catch (err) {
    console.error('Track failed:', err);
  }
  
  navigate(`/search?q=${encodeURIComponent(text)}`);
};

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => prev < results.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex].text);
        } else if (query.trim()) {
          handleSelect(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-600 dark:text-black font-semibold rounded px-0.5">{part}</mark> : part
    );
  };

  const showRecent = !query.trim() && state.recentSearches.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cari tutorial, dokumentasi... (Ctrl+K)"
          className="w-full pl-12 pr-24 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl 
                     focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30
                     text-lg shadow-sm transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400 font-mono border border-gray-200 dark:border-gray-600">
            <Command className="w-3 h-3" />K
          </kbd>
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
                        border border-gray-100 dark:border-gray-700 overflow-hidden z-50 max-h-[28rem] overflow-y-auto">
          
          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto border-b border-gray-100 dark:border-gray-700">
              <Filter className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Did You Mean */}
          {didYouMeanText && (
            <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30">
              <button onClick={() => handleSelect(didYouMeanText)} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Maksud kamu: <span className="font-bold underline">{didYouMeanText}</span>?
              </button>
            </div>
          )}

          {/* Recent Searches */}
          {showRecent && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Pencarian Terakhir</span>
                </div>
                <button onClick={() => dispatch({ type: 'CLEAR_RECENT' })} className="text-xs text-red-500 hover:text-red-700 font-medium">Hapus Semua</button>
              </div>
              {state.recentSearches.map((item, idx) => (
                <button key={idx} onClick={() => handleSelect(item)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-left transition-colors text-gray-700 dark:text-gray-200">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              {!showRecent && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Hasil Pencarian ({results.length})</span>
                  {results[0]?.distance !== undefined && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">Fuzzy Match</span>}
                </div>
              )}
              {results.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.text)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all border border-transparent ${
                    idx === highlightedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Search className={`w-4 h-4 shrink-0 ${idx === highlightedIndex ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div className="min-w-0">
                      <p className="text-gray-800 dark:text-gray-100 truncate">{highlightMatch(item.text, query)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0 ml-2">
                    <ArrowUpDown className="w-3 h-3" />
                    {item.count}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!showRecent && query.trim() && results.length === 0 && !didYouMeanText && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Tidak ada hasil untuk "{query}"</p>
              <button onClick={() => handleSelect(query)} className="mt-3 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm">Cari dengan kata kunci ini</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
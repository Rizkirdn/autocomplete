import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Search, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { MaxHeap } from '../utils/heap';
import { api } from '../services/api';  // ← HARUS ADA
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { state } = useApp();
  
  const totalSuggestions = state.suggestions.length;
  const totalSearches = state.suggestions.reduce((acc, s) => acc + s.count, 0);
  const avgCount = Math.round(totalSearches / (totalSuggestions || 1));

  const stats = [
    { label: 'Total Data', value: totalSuggestions, icon: Database, color: 'blue' },
    { label: 'Total Pencarian', value: totalSearches.toLocaleString(), icon: Search, color: 'green' },
    { label: 'Rata-rata/Item', value: avgCount, icon: TrendingUp, color: 'purple' },
    { label: 'Riwayat Tersimpan', value: state.recentSearches.length, icon: Users, color: 'orange' },
  ];

  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  const topItems = useMemo(() => {
    const heap = new MaxHeap();
    state.suggestions.forEach(s => heap.push(s));
    return heap.toSortedArray(5);
  }, [state.suggestions]);

  const categoryData = useMemo(() => {
    const map = {};
    state.suggestions.forEach(s => {
      map[s.category] = (map[s.category] || 0) + s.count;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [state.suggestions]);

  const pieColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[stat.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Items with Heap */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Top 5 Trending (Max Heap)
          </h3>
          <div className="space-y-3">
            {topItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{item.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <ArrowUpRight className="w-4 h-4" />
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Riwayat Pencarian Terakhir</h3>
          {state.recentSearches.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Belum ada riwayat pencarian</p>
          ) : (
            <div className="space-y-2">
              {state.recentSearches.slice(0, 8).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-200">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Distribusi per Kategori</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Proporsi Kategori</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
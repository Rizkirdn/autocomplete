import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, ExternalLink } from 'lucide-react';

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-blue-600" />
            <h1 className="font-semibold text-lg text-gray-800 dark:text-white">{query}</h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hasil Pencarian untuk "{query}"</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Halaman hasil pencarian simulasi dengan struktur data Trie dan Fuzzy Matching.</p>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm">Tutorial</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
                  {i}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-2">
                    Dokumentasi {query} - Bagian {i}
                    <ExternalLink className="w-3 h-3" />
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">https://docs.example.com/{query.toLowerCase().replace(/\s+/g, '-')}/{i}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Panduan lengkap tentang {query} dengan contoh kode dan penjelasan detail.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
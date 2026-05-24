import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, LogOut, Search, Shield, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLayout() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT_ADMIN' });
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/data', icon: Database, label: 'Kelola Data' },
  ];

  if (!state.adminUser) return <Outlet />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg dark:text-white">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}>
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
            {state.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {state.darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{state.adminUser.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{state.adminUser.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {navItems.find(n => n.path === location.pathname)?.label || 'Admin'}
            </h1>
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <Search className="w-4 h-4" />
              Lihat Aplikasi
            </Link>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
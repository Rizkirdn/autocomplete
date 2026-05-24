import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Home from './pages/Home';
import SearchResult from './pages/SearchResult';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminData from './pages/AdminData';
import ToastContainer from './components/Toast';

function AdminRoute({ children }) {
  const { state } = useApp();
  return state.adminUser ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="login" element={<AdminLogin />} />
            <Route index element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="data" element={<AdminRoute><AdminData /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
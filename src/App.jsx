import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MealManagement from './pages/MealManagement';
import MealPlanManagement from './pages/MealPlanManagement';
import OrderManagement from './pages/OrderManagement';
import Sidebar from './components/Sidebar';
import AdminLoginTest from './pages/AdminLoginTest';
import Login from './components/Login/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    
    // Listen for storage events (in case token is added/removed in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      {isAuthenticated ? (
        <div className="admin-layout">
          <Sidebar />
          <main className="admin-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/meals" element={<MealManagement />} />
              <Route path="/meal-plans" element={<MealPlanManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/login-test" element={<AdminLoginTest />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App; 
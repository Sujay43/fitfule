import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminToken, isValidAdminToken, handleAdminAuthError } from '../utils/auth';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalMealPlans: 0,
    totalMeals: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verify admin token on component mount
    const adminToken = getAdminToken();
    if (!adminToken) {
      handleAdminAuthError(navigate, 'Authentication required. Please login.');
      return;
    }
    
    if (!isValidAdminToken(adminToken)) {
      handleAdminAuthError(navigate, 'Your session has expired. Please login again.');
      return;
    }
    
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const adminToken = getAdminToken();
      
      if (!adminToken) {
        handleAdminAuthError(navigate, 'Authentication required. Please login.');
        return;
      }
      
      // Log token for debugging (partial, for security)
      console.log('Fetching dashboard stats with token:', adminToken.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:5004/api/admin/dashboard-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Handle unauthorized access
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Auth error:', errorData);
        handleAdminAuthError(navigate, errorData.message || 'Authentication failed. Please login again.');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dashboard stats received:', data);
      setStats(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return (
    <div className="error">
      <p>Error: {error}</p>
      <button onClick={fetchDashboardStats} className="retry-button">Retry</button>
    </div>
  );

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Meal Plans</h3>
          <p className="stat-value">{stats.totalMealPlans}</p>
        </div>
        <div className="stat-card">
          <h3>Total Meals</h3>
          <p className="stat-value">{stats.totalMeals}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 
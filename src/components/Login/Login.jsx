import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { decodeAdminToken } from '../../utils/auth';
// Login styles are now in App.css

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle any error messages passed via location state
  useEffect(() => {
    if (location.state && location.state.error) {
      setError(location.state.error);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      console.log('Attempting admin login with:', { email, password });
      
      const response = await fetch('http://localhost:5004/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Ensure token exists in the response
      if (!data.token) {
        throw new Error('No token received from server');
      }

      console.log('Admin token received:', data.token.substring(0, 20) + '...');
      
      // Store the admin token
      localStorage.setItem('adminToken', data.token);
      
      // Decode and verify the token
      const decodedToken = decodeAdminToken(data.token);
      if (decodedToken) {
        console.log("Decoded admin token payload:", decodedToken);
        
        // Verify this is an admin token
        if (!decodedToken.isAdmin && decodedToken.role !== 'admin') {
          throw new Error('The token does not have admin privileges');
        }
        
        // Log expiration info
        const expiresAt = new Date(decodedToken.exp * 1000).toLocaleString();
        const expiresIn = Math.floor((decodedToken.exp * 1000 - Date.now()) / 1000 / 60);
        console.log(`Token expires at ${expiresAt} (in ${expiresIn} minutes)`);
      } else {
        console.warn("Token doesn't appear to be a valid JWT format");
      }
      
      // Store admin data if available
      if (data.admin) {
        localStorage.setItem('adminData', JSON.stringify(data.admin));
      }

      // Call the onLogin callback to update parent component
      if (onLogin) {
        onLogin();
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>Admin Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 
import React, { useState, useEffect } from 'react';

function AdminLoginTest() {
  const [adminToken, setAdminToken] = useState('');
  const [decodedToken, setDecodedToken] = useState({});
  const [status, setStatus] = useState('');
  const [authCheckResult, setAuthCheckResult] = useState({});
  const [email, setEmail] = useState('admin@fitfuel.com');
  const [password, setPassword] = useState('admin123');

  useEffect(() => {
    // Check if token exists in localStorage when component mounts
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminToken(token);
      decodeToken(token);
    }
  }, []);

  const decodeToken = (token) => {
    try {
      // Token structure is: header.payload.signature
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      setDecodedToken(JSON.parse(jsonPayload));
    } catch (error) {
      console.error('Error decoding token:', error);
      setDecodedToken({ error: 'Invalid token format' });
    }
  };

  const handleLogin = async () => {
    try {
      setStatus('Logging in...');
      const response = await fetch('http://localhost:5004/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the admin token
      localStorage.setItem('adminToken', data.token);
      setAdminToken(data.token);
      decodeToken(data.token);
      setStatus('Login successful! Token stored.');
    } catch (error) {
      setStatus(`Login error: ${error.message}`);
    }
  };

  const checkAuth = async () => {
    try {
      setStatus('Checking auth...');
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setStatus('No token found in localStorage');
        return;
      }

      const response = await fetch('http://localhost:5004/api/debug/auth-check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setAuthCheckResult(data);
      setStatus('Auth check complete');
    } catch (error) {
      setStatus(`Auth check error: ${error.message}`);
    }
  };

  const checkOrders = async () => {
    try {
      setStatus('Fetching orders...');
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setStatus('No token found in localStorage');
        return;
      }

      const response = await fetch('http://localhost:5004/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed: ${response.status} ${errorData.message || ''}`);
      }

      const data = await response.json();
      setStatus(`Found ${data.length} orders`);
    } catch (error) {
      setStatus(`Orders fetch error: ${error.message}`);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
    setDecodedToken({});
    setStatus('Token cleared from localStorage');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin Login Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Login</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>Email: </label>
          <input 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ marginLeft: '10px', width: '250px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ marginLeft: '10px', width: '250px' }}
          />
        </div>
        <button onClick={handleLogin}>Login</button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current Token</h2>
        <div style={{ overflowWrap: 'break-word', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          {adminToken || 'No token stored'}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Decoded Token</h2>
        <pre style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          {JSON.stringify(decodedToken, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Actions</h2>
        <button onClick={checkAuth} style={{ marginRight: '10px' }}>Test Auth</button>
        <button onClick={checkOrders} style={{ marginRight: '10px' }}>Check Orders</button>
        <button onClick={clearToken}>Clear Token</button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Status</h2>
        <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          {status || 'Ready'}
        </div>
      </div>
      
      <div>
        <h2>Auth Check Result</h2>
        <pre style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          {JSON.stringify(authCheckResult, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default AdminLoginTest; 
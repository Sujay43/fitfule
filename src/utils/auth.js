/**
 * Admin authentication utility functions
 */

/**
 * Decodes an admin JWT token without verification
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} - The decoded token payload or null if invalid
 */
export const decodeAdminToken = (token) => {
  if (!token) return null;
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding admin token:', error);
    return null;
  }
};

/**
 * Checks if an admin token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if expired or invalid, false otherwise
 */
export const isAdminTokenExpired = (token) => {
  const decodedToken = decodeAdminToken(token);
  if (!decodedToken || !decodedToken.exp) {
    return true;
  }
  
  const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
};

/**
 * Validates an admin token by checking if it exists, is not expired, and has admin role
 * @param {string} token - The JWT token to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidAdminToken = (token) => {
  if (!token) return false;
  
  const decodedToken = decodeAdminToken(token);
  if (!decodedToken) return false;
  
  // Check if token is expired
  if (isAdminTokenExpired(token)) return false;
  
  // Check if token has admin rights
  return decodedToken.isAdmin === true || decodedToken.role === 'admin';
};

/**
 * Gets the current admin token from localStorage
 * @returns {string|null} - The token or null if not found
 */
export const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

/**
 * Gets the current admin data from localStorage
 * @returns {Object|null} - The admin data or null if not found
 */
export const getAdminData = () => {
  const adminStr = localStorage.getItem('adminData');
  if (!adminStr) return null;
  
  try {
    return JSON.parse(adminStr);
  } catch (e) {
    console.error('Error parsing admin data:', e);
    return null;
  }
};

/**
 * Logs out the admin by removing authentication data
 */
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
};

/**
 * Handles admin authentication errors by logging out and redirecting
 * @param {Function} navigate - React Router's navigate function
 * @param {string} message - Error message to display
 */
export const handleAdminAuthError = (navigate, message = 'Authentication failed. Please login again.') => {
  logoutAdmin();
  navigate('/login', { state: { error: message } });
}; 
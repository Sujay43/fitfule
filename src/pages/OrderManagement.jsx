import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminToken, isValidAdminToken, handleAdminAuthError, decodeAdminToken } from '../utils/auth';
import './MealManagement.css'; // We'll reuse some of the styling

function OrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    console.log("OrderManagement component mounted");
    
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
    
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders...");
      const adminToken = getAdminToken();
      
      if (!adminToken) {
        handleAdminAuthError(navigate, 'Authentication required. Please login.');
        return;
      }
      
      // Log token information for debugging
      const decodedToken = decodeAdminToken(adminToken);
      if (decodedToken) {
        console.log("Admin token details:", {
          isAdmin: decodedToken.isAdmin,
          role: decodedToken.role,
          exp: new Date(decodedToken.exp * 1000).toLocaleString(),
          expiresIn: Math.floor((decodedToken.exp * 1000 - Date.now()) / 1000 / 60) + ' minutes'
        });
      }
      
      console.log('Fetching orders with token:', adminToken.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:5004/api/admin/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log("API response status:", response.status);
      
      // Handle unauthorized access
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Auth error:', errorData);
        handleAdminAuthError(navigate, errorData.message || 'Authentication failed. Please login again.');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error("Error response data:", errorData);
        throw new Error(`HTTP error! status: ${response.status}. ${errorData.message || ''}`);
      }
      
      const data = await response.json();
      console.log("Orders data received:", data);
      setOrders(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const adminToken = getAdminToken();
      
      if (!adminToken) {
        handleAdminAuthError(navigate, 'Authentication required. Please login.');
        return;
      }
      
      const response = await fetch(`http://localhost:5004/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Handle unauthorized access
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        handleAdminAuthError(navigate, errorData.message || 'Authentication failed. Please login again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update order status');
      }

      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status: ' + err.message);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return (
    <div className="error">
      <p>Error: {error}</p>
      <button onClick={fetchOrders} className="retry-button">Retry</button>
    </div>
  );

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="order-management">
      <h1>Order Management</h1>
      
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No orders available</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id ? order._id.slice(-6) : 'N/A'}</td>
                  <td>{order.userId?.name || 'Guest'}</td>
                  <td>
                    {Array.isArray(order.items) ? order.items.map(item => (
                      <div key={item._id || `item-${Math.random()}`}>
                        {item.quantity || 1} x {item.name || item.productName || 'Unknown Item'}
                      </div>
                    )) : <div>No items</div>}
                  </td>
                  <td>${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}</td>
                  <td>
                    <select 
                      value={order.status || 'pending'}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`status-${order.status || 'pending'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <button onClick={() => handleViewDetails(order)}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-button" onClick={closeDetailsModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-section">
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                <p><strong>Status:</strong> {selectedOrder.status || 'pending'}</p>
                <p><strong>Total:</strong> ${typeof selectedOrder.total === 'number' ? selectedOrder.total.toFixed(2) : '0.00'}</p>
              </div>
              
              <div className="order-detail-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.userId?.name || 'Guest'}</p>
                <p><strong>Email:</strong> {selectedOrder.userId?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedOrder.userId?.phone || 'N/A'}</p>
              </div>
              
              <div className="order-detail-section">
                <h3>Delivery Information</h3>
                <p><strong>Address:</strong> {selectedOrder.deliveryAddress?.street || 'N/A'}</p>
                <p><strong>City:</strong> {selectedOrder.deliveryAddress?.city || 'N/A'}</p>
                <p><strong>State:</strong> {selectedOrder.deliveryAddress?.state || 'N/A'}</p>
                <p><strong>Zip Code:</strong> {selectedOrder.deliveryAddress?.zipCode || 'N/A'}</p>
              </div>
              
              <div className="order-detail-section">
                <h3>Order Items</h3>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item, index) => (
                      <tr key={item._id || `detail-item-${index}`}>
                        <td>{item.name || item.productName || 'Unknown Item'}</td>
                        <td>{item.quantity || 1}</td>
                        <td>${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</td>
                        <td>${typeof item.price === 'number' && typeof item.quantity === 'number' 
                          ? (item.price * item.quantity).toFixed(2) 
                          : '0.00'}</td>
                      </tr>
                    )) : <tr><td colSpan="4">No items</td></tr>}
                  </tbody>
                </table>
              </div>
              
              <div className="order-detail-section">
                <h3>Payment Information</h3>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
                <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'N/A'}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeDetailsModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement; 
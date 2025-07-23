import React, { useState, useEffect } from 'react';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...'); // Debug log
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      console.log('Admin token exists:', !!adminToken);
      
      const response = await fetch('http://localhost:5004/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch orders: ${response.status} ${errorData.message || ''}`);
      }

      const data = await response.json();
      console.log('Fetched orders:', data); // Debug log
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch(`http://localhost:5004/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after update
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="orders-container">
      <h2>Order Management</h2>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders available</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order._id.slice(-6)}</h3>
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="order-details">
                <div className="customer-info">
                  <h4>Customer Details</h4>
                  <p>{order.deliveryDetails.fullName}</p>
                  <p>{order.deliveryDetails.phone}</p>
                  <p>{order.deliveryDetails.address}</p>
                </div>

                <div className="order-items">
                  <h4>Items</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <div className="total">
                    <strong>Total:</strong>
                    <strong>${order.total.toFixed(2)}</strong>
                  </div>
                  <div className="payment-method">
                    Payment: {order.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="order-actions">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className={`status-select ${order.status}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="preparing">Preparing</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders; 
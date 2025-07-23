import React, { useState, useEffect } from 'react';
import './OrderManagement.css';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  // Poll for new orders every 30 seconds
  useEffect(() => {
    fetchOrders(); // Initial fetch

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch('http://localhost:5004/api/admin/orders', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      
      // Check for new orders
      if (orders.length > 0 && data.length > orders.length) {
        setNewOrderAlert(true);
        // Play notification sound
        new Audio('/notification.mp3').play().catch(e => console.log('Audio play failed:', e));
      }
      
      setOrders(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch(`http://localhost:5004/api/admin/orders/${orderId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to confirm order');
      }

      // Update orders list with confirmed status
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'accepted' } : order
      ));

      // Show success message
      alert('Order confirmed successfully');
    } catch (error) {
      alert('Error confirming order: ' + error.message);
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

      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      alert('Error updating order status: ' + error.message);
    }
  };

  const assignCourier = async (orderId, courierId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch(`http://localhost:5004/api/admin/orders/${orderId}/assign-courier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ courierId })
      });

      if (!response.ok) {
        throw new Error('Failed to assign courier');
      }

      // Update orders list with assigned courier
      const updatedOrder = await response.json();
      setOrders(orders.map(order => 
        order._id === orderId ? updatedOrder : order
      ));

      alert('Courier assigned successfully');
    } catch (error) {
      alert('Error assigning courier: ' + error.message);
    }
  };

  const printOrder = (order) => {
    const printContent = `
      Order #${order._id}
      Customer: ${order.deliveryDetails.fullName}
      Address: ${order.deliveryDetails.address}
      Items:
      ${order.items.map(item => `${item.name} x${item.quantity} - $${item.price}`).join('\n')}
      Total: $${order.total}
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre>${printContent}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order.deliveryDetails.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="order-management">
      {newOrderAlert && (
        <div className="new-order-alert" onClick={() => setNewOrderAlert(false)}>
          New order received! Click to dismiss.
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Orders</option>
          <option value="pending">New Orders</option>
          <option value="accepted">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="out-for-delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="orders-grid">
        {filteredOrders.map(order => (
          <div key={order._id} className={`order-card ${order.status}`}>
            <div className="order-header">
              <h3>Order #{order._id.slice(-6)}</h3>
              <span className={`status-badge ${order.status}`}>
                {order.status}
              </span>
            </div>

            <div className="order-time">
              <p>Ordered: {new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div className="customer-details">
              <h4>Customer Details</h4>
              <p><strong>Name:</strong> {order.deliveryDetails.fullName}</p>
              <p><strong>Phone:</strong> {order.deliveryDetails.phone}</p>
              <p><strong>Address:</strong> {order.deliveryDetails.address}</p>
              {order.deliveryDetails.instructions && (
                <p><strong>Instructions:</strong> {order.deliveryDetails.instructions}</p>
              )}
            </div>

            <div className="order-items">
              <h4>Order Items</h4>
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="order-total">
                <strong>Total Amount:</strong>
                <strong>${order.total.toFixed(2)}</strong>
              </div>
              <div className="payment-info">
                <strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}
              </div>
            </div>

            <div className="order-actions">
              {order.status === 'pending' && (
                <button
                  onClick={() => confirmOrder(order._id)}
                  className="btn-confirm"
                >
                  Confirm Order
                </button>
              )}
              
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                className="status-select"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => assignCourier(order._id)}
                className="btn-assign"
                disabled={order.status === 'delivered' || order.status === 'cancelled'}
              >
                Assign Courier
              </button>

              <button
                onClick={() => printOrder(order)}
                className="btn-print"
              >
                Print Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderManagement; 
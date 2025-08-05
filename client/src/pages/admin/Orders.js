import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

const AdminOrders = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate]);

  const { data: ordersData, isLoading } = useQuery(
    'admin-orders',
    () => axios.get('/api/orders').then(res => res.data),
    {
      enabled: isAuthenticated && user?.role === 'admin',
    }
  );

  const updateStatusMutation = useMutation(
    ({ orderId, status }) => axios.put(`/api/orders/${orderId}/status`, { status }),
    {
      onSuccess: () => {
        toast.success('Order status updated successfully!');
        queryClient.invalidateQueries('admin-orders');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update order status');
      }
    }
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'processing':
        return 'badge-processing';
      case 'shipped':
        return 'badge-shipped';
      case 'delivered':
        return 'badge-delivered';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  };

  const orders = ordersData?.orders || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Admin Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
            HalleyX Admin - Orders
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Dashboard
              </Link>
              <Link to="/admin/products" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Products
              </Link>
              <Link to="/admin/orders" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: '500' }}>
                Orders
              </Link>
              <Link to="/admin/customers" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Customers
              </Link>
            </nav>
            
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '2rem 0' }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Orders Management
            </h2>
            <p style={{ color: '#6b7280' }}>
              View and manage customer orders
            </p>
          </div>

          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-6 text-center">
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                No orders found
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map((order) => (
                <div key={order._id} className="card p-6">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        Customer: {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                          Order Status
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="form-input"
                          style={{ width: '150px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                      Order Items
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {order.orderItems.map((item) => (
                        <div key={item._id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                          <div style={{ width: '60px', height: '60px', background: '#e5e7eb', borderRadius: '0.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.product.imageUrl ? (
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                              />
                            ) : (
                              <div style={{ color: '#9ca3af', fontSize: '1.5rem' }}>📦</div>
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                              {item.product.name}
                            </h5>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                              Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <div className="grid grid-2 gap-4">
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          Customer Information
                        </h4>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          <strong>Name:</strong> {order.customer.firstName} {order.customer.lastName}
                          <br />
                          <strong>Email:</strong> {order.customer.email}
                        </p>
                      </div>
                      
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          Shipping Address
                        </h4>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {order.shippingAddress.addressLine1}
                          {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                          <br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          <br />
                          {order.shippingAddress.country}
                          <br />
                          <strong>Phone:</strong> {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
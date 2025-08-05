import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data: ordersData, isLoading } = useQuery(
    'orders',
    () => axios.get('/api/orders').then(res => res.data),
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
    }
  );

  const orders = ordersData?.orders || [];

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

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header />
      
      <div style={{ padding: '2rem 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem' }}>
            My Orders
          </h1>

          {orders.length === 0 ? (
            <div className="card p-6 text-center">
              <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1rem' }}>
                You haven't placed any orders yet
              </p>
              <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                Start shopping to see your orders here
              </p>
              <Link to="/products" className="btn btn-primary">
                Browse Products
              </Link>
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
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '0.5rem' }}>
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
                      Phone: {order.shippingAddress.phone}
                    </p>
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

export default Orders;
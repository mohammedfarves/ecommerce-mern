import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Users, ShoppingCart, DollarSign, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate]);

  const { data: stats, isLoading } = useQuery(
    'admin-stats',
    () => axios.get('/api/admin/stats').then(res => res.data),
    {
      enabled: isAuthenticated && user?.role === 'admin',
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: recentOrders } = useQuery(
    'recent-orders',
    () => axios.get('/api/orders?limit=5').then(res => res.data),
    {
      enabled: isAuthenticated && user?.role === 'admin',
      staleTime: 5 * 60 * 1000,
    }
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Admin Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
              HalleyX Admin
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Welcome back, {user?.firstName}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: '500' }}>
                Dashboard
              </Link>
              <Link to="/admin/products" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Products
              </Link>
              <Link to="/admin/orders" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Orders
              </Link>
              <Link to="/admin/customers" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Customers
              </Link>
            </nav>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '2rem 0' }}>
        <div className="container">
          {/* Stats Cards */}
          <div className="grid grid-4 mb-8">
            <div className="card p-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Total Products
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                    {stats?.totalProducts || 0}
                  </p>
                </div>
                <div style={{ background: '#dbeafe', borderRadius: '50%', padding: '0.75rem' }}>
                  <Package size={24} style={{ color: '#2563eb' }} />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Total Customers
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                    {stats?.totalCustomers || 0}
                  </p>
                </div>
                <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '0.75rem' }}>
                  <Users size={24} style={{ color: '#16a34a' }} />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Total Orders
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                    {stats?.totalOrders || 0}
                  </p>
                </div>
                <div style={{ background: '#fef3c7', borderRadius: '50%', padding: '0.75rem' }}>
                  <ShoppingCart size={24} style={{ color: '#d97706' }} />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Total Revenue
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div style={{ background: '#f3e8ff', borderRadius: '50%', padding: '0.75rem' }}>
                  <DollarSign size={24} style={{ color: '#9333ea' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-2 gap-4 mb-8">
            <div className="card p-6">
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Quick Actions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link to="/admin/products" className="btn btn-primary">
                  Manage Products
                </Link>
                <Link to="/admin/orders" className="btn btn-outline">
                  View All Orders
                </Link>
                <Link to="/admin/customers" className="btn btn-outline">
                  Manage Customers
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Recent Orders
              </h2>
              {recentOrders?.orders?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentOrders.orders.slice(0, 5).map((order) => (
                    <div key={order._id} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          #{order._id.slice(-8)}
                        </span>
                        <span className={`badge ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {order.customer?.firstName} {order.customer?.lastName}
                        </span>
                        <span style={{ fontWeight: '600' }}>
                          ${parseFloat(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                  No recent orders
                </p>
              )}
            </div>
          </div>

          {/* Store Link */}
          <div className="card p-6 text-center">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              View Store
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              See how your store looks to customers
            </p>
            <Link to="/" className="btn btn-outline">
              Visit Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
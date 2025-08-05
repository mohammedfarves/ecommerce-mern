import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const AdminCustomers = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate]);

  const { data: customersData, isLoading } = useQuery(
    'admin-customers',
    () => axios.get('/api/admin/customers').then(res => res.data),
    {
      enabled: isAuthenticated && user?.role === 'admin',
    }
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const customers = customersData?.customers || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Admin Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
            HalleyX Admin - Customers
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Dashboard
              </Link>
              <Link to="/admin/products" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Products
              </Link>
              <Link to="/admin/orders" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Orders
              </Link>
              <Link to="/admin/customers" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: '500' }}>
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
              Customer Management
            </h2>
            <p style={{ color: '#6b7280' }}>
              View and manage registered customers
            </p>
          </div>

          <div className="card">
            {isLoading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              background: '#3b82f6', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600'
                            }}>
                              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                {customer.firstName} {customer.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>{customer.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${customer.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                            {customer.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                          {new Date(customer.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {customers.length === 0 && (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                    No customers found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
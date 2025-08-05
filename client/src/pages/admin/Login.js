import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already authenticated as admin
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (isAuthenticated && user?.role === 'customer') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password, true); // true for admin login
      if (user.role !== 'admin') {
        toast.error('Admin access required');
        return;
      }
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Seed admin user on component mount
  React.useEffect(() => {
    const seedAdmin = async () => {
      try {
        await fetch('/api/auth/seed-admin', { method: 'POST' });
      } catch (error) {
        // Ignore if admin already exists
      }
    };
    seedAdmin();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#f3f4f6', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Shield size={40} style={{ color: '#667eea' }} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Admin Portal
          </h1>
          <p style={{ color: '#6b7280' }}>
            Sign in to access admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-input"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email'
                }
              })}
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              placeholder="Enter admin password"
            />
            {errors.password && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {isLoading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Demo Admin Credentials:
          </p>
          <p style={{ color: '#1f2937', fontSize: '0.875rem' }}>
            <strong>Email:</strong> admin@example.com<br />
            <strong>Password:</strong> admin123
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
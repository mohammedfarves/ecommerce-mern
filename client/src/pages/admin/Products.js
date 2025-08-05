import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, LogOut } from 'lucide-react';

const AdminProducts = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate]);

  const { data: productsData, isLoading } = useQuery(
    'admin-products',
    () => axios.get('/api/products?limit=100').then(res => res.data),
    {
      enabled: isAuthenticated && user?.role === 'admin',
    }
  );

  const createProductMutation = useMutation(
    (formData) => axios.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        toast.success('Product created successfully!');
        queryClient.invalidateQueries('admin-products');
        setShowCreateForm(false);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create product');
      }
    }
  );

  const updateProductMutation = useMutation(
    ({ id, formData }) => axios.put(`/api/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        toast.success('Product updated successfully!');
        queryClient.invalidateQueries('admin-products');
        setEditingProduct(null);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  );

  const deleteProductMutation = useMutation(
    (id) => axios.delete(`/api/products/${id}`),
    {
      onSuccess: () => {
        toast.success('Product deleted successfully!');
        queryClient.invalidateQueries('admin-products');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('stockQuantity', data.stockQuantity);
    formData.append('category', data.category);
    
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowCreateForm(true);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('stockQuantity', product.stockQuantity);
    setValue('category', product.category);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const products = productsData?.products || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Admin Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
            HalleyX Admin - Products
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                Dashboard
              </Link>
              <Link to="/admin/products" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: '500' }}>
                Products
              </Link>
              <Link to="/admin/orders" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
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
          {/* Header with Add Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Products Management
              </h2>
              <p style={{ color: '#6b7280' }}>
                Manage your store products
              </p>
            </div>
            
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingProduct(null);
                reset();
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="card p-6 mb-6">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-input"
                      {...register('name', { required: 'Product name is required' })}
                      placeholder="Enter product name"
                    />
                    {errors.name && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.name.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      {...register('category')}
                      placeholder="Enter category"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
                      placeholder="0.00"
                    />
                    {errors.price && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.price.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      {...register('stockQuantity', { required: 'Stock quantity is required', min: { value: 0, message: 'Stock cannot be negative' } })}
                      placeholder="0"
                    />
                    {errors.stockQuantity && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.stockQuantity.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    {...register('description')}
                    placeholder="Enter product description"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    {...register('image')}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingProduct(null);
                      reset();
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
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
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Price</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Stock</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', background: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                              ) : (
                                <span style={{ color: '#9ca3af' }}>📦</span>
                              )}
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{product.name}</p>
                              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>${product.price}</td>
                        <td style={{ padding: '1rem' }}>{product.stockQuantity}</td>
                        <td style={{ padding: '1rem' }}>{product.category || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleEdit(product)}
                              className="btn btn-outline"
                              style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="btn btn-outline"
                              style={{ color: '#dc2626', borderColor: '#dc2626', padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {products.length === 0 && (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                    No products found. Create your first product to get started.
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

export default AdminProducts;
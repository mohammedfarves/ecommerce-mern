import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import Header from '../../components/Header';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Search } from 'lucide-react';

const Products = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const { addToCart } = useCart();

  const { data: productsData, isLoading } = useQuery(
    ['products', search, sortBy, sortOrder],
    () => axios.get(`/api/products?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=50`).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const products = productsData?.products || [];

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header />
      
      <div style={{ padding: '2rem 0' }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              Our Products
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Discover amazing products for every need
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card p-6 mb-6">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <form onSubmit={handleSearch} style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#9ca3af' 
                  }} 
                />
              </form>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="form-input"
                style={{ width: '200px' }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="card p-6 text-center">
              <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '1rem' }}>
                No products found
              </p>
              {search && (
                <p style={{ color: '#9ca3af' }}>
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Showing {products.length} products
              </div>
              
              <div className="grid grid-4">
                {products.map((product) => (
                  <div key={product._id} className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ height: '200px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ color: '#9ca3af', fontSize: '3rem' }}>📦</div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {product.name}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem', minHeight: '2.5rem' }}>
                        {product.description || 'No description available'}
                      </p>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669' }}>
                          ${product.price}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                          {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product._id)}
                        disabled={product.stockQuantity === 0}
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: '0.5rem',
                          opacity: product.stockQuantity === 0 ? 0.5 : 1,
                          cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <ShoppingCart size={16} />
                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
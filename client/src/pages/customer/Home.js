import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import Header from '../../components/Header';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

const Home = () => {
  const { addToCart } = useCart();

  const { data: productsData, isLoading } = useQuery(
    'featured-products',
    () => axios.get('/api/products?limit=8').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const products = productsData?.products || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Header />
      
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(105deg, #6a8affff 0%, #78bc9c 100%)', color: 'white', padding: '4rem 0' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
            Welcome to HalleyX Store
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            Discover amazing products at unbeatable prices
          </p>
          <Link to="/products" className="btn btn-primary" style={{ background: 'white', color: '#009900ff', padding: '1rem 2rem' }}>
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              Featured Products
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Check out our most popular items
            </p>
          </div>

          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
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
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {product.description || 'No description available'}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669' }}>
                        ${product.price}
                      </span>
                      <button 
                        onClick={() => addToCart(product._id)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/products" className="btn btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'white', padding: '4rem 0' }}>
        <div className="container">
          <div className="grid grid-3">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Free Delivery
              </h3>
              <p style={{ color: '#6b7280' }}>
                Free shipping on all orders over $50
              </p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Secure Payment
              </h3>
              <p style={{ color: '#6b7280' }}>
                100% secure payment processing
              </p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Quality Products
              </h3>
              <p style={{ color: '#6b7280' }}>
                Carefully curated high-quality items
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
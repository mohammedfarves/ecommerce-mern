import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

const Cart = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const { cartItems, updateCartItem, removeFromCart, clearCart, getCartTotal, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const createOrderMutation = useMutation(
    (orderData) => axios.post('/api/orders', orderData).then(res => res.data),
    {
      onSuccess: () => {
        toast.success('Order placed successfully!');
        queryClient.invalidateQueries('cart');
        navigate('/orders');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    }
  );

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItem(itemId, newQuantity);
    }
  };

  const onCheckout = async (data) => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    createOrderMutation.mutate({
      shippingAddress: data
    });
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
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="card p-6 text-center">
              <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1rem' }}>
                Your cart is empty
              </p>
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-2 gap-4">
              {/* Cart Items */}
              <div>
                <div className="card p-6">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                      Cart Items ({cartItems.length})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="btn btn-outline"
                      style={{ color: '#dc2626', borderColor: '#dc2626' }}
                    >
                      Clear Cart
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cartItems.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '0.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            {item.product.name}
                          </h3>
                          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            ${item.product.price} each
                          </p>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem', width: '32px', height: '32px' }}
                              >
                                <Minus size={16} />
                              </button>
                              <span style={{ fontWeight: '600', minWidth: '2rem', textAlign: 'center' }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem', width: '32px', height: '32px' }}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="btn btn-outline"
                              style={{ color: '#dc2626', borderColor: '#dc2626', padding: '0.25rem', width: '32px', height: '32px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary & Checkout */}
              <div>
                <div className="card p-6">
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    Order Summary
                  </h2>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Subtotal</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <hr style={{ margin: '1rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: '700' }}>
                      <span>Total</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {!showCheckout ? (
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <form onSubmit={handleSubmit(onCheckout)}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                        Shipping Address
                      </h3>

                      <div className="form-group">
                        <label className="form-label">Address Line 1</label>
                        <input
                          type="text"
                          className="form-input"
                          {...register('addressLine1', { required: 'Address is required' })}
                          placeholder="123 Main Street"
                        />
                        {errors.addressLine1 && (
                          <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {errors.addressLine1.message}
                          </p>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          className="form-input"
                          {...register('addressLine2')}
                          placeholder="Apartment, suite, etc."
                        />
                      </div>

                      <div className="grid grid-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            className="form-input"
                            {...register('city', { required: 'City is required' })}
                            placeholder="New York"
                          />
                          {errors.city && (
                            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                              {errors.city.message}
                            </p>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="form-label">State</label>
                          <input
                            type="text"
                            className="form-input"
                            {...register('state', { required: 'State is required' })}
                            placeholder="NY"
                          />
                          {errors.state && (
                            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                              {errors.state.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">ZIP Code</label>
                          <input
                            type="text"
                            className="form-input"
                            {...register('zipCode', { required: 'ZIP code is required' })}
                            placeholder="10001"
                          />
                          {errors.zipCode && (
                            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                              {errors.zipCode.message}
                            </p>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Country</label>
                          <input
                            type="text"
                            className="form-input"
                            {...register('country', { required: 'Country is required' })}
                            placeholder="United States"
                          />
                          {errors.country && (
                            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                              {errors.country.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-input"
                          {...register('phone', { required: 'Phone number is required' })}
                          placeholder="+1 (555) 123-4567"
                        />
                        {errors.phone && (
                          <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => setShowCheckout(false)}
                          className="btn btn-outline"
                          style={{ flex: 1 }}
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={createOrderMutation.isLoading}
                          style={{ flex: 1 }}
                        >
                          {createOrderMutation.isLoading ? 'Placing Order...' : 'Place Order'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
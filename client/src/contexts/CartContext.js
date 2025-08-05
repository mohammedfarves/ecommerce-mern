import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery(
    'cart',
    () => axios.get('/api/cart').then(res => res.data),
    {
      enabled: isAuthenticated,
      onError: (error) => {
        if (error.response?.status !== 401) {
          toast.error('Failed to load cart');
        }
      }
    }
  );

  // Add to cart mutation
  const addToCartMutation = useMutation(
    ({ productId, quantity = 1 }) => 
      axios.post('/api/cart', { productId, quantity }).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Added to cart');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
    }
  );

  // Update cart item mutation
  const updateCartMutation = useMutation(
    ({ itemId, quantity }) => 
      axios.put(`/api/cart/${itemId}`, { quantity }).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update cart');
      }
    }
  );

  // Remove from cart mutation
  const removeFromCartMutation = useMutation(
    (itemId) => axios.delete(`/api/cart/${itemId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Removed from cart');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove item');
      }
    }
  );

  // Clear cart mutation
  const clearCartMutation = useMutation(
    () => axios.delete('/api/cart'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to clear cart');
      }
    }
  );

  const addToCart = (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    addToCartMutation.mutate({ productId, quantity });
  };

  const updateCartItem = (itemId, quantity) => {
    updateCartMutation.mutate({ itemId, quantity });
  };

  const removeFromCart = (itemId) => {
    removeFromCartMutation.mutate(itemId);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isAdding: addToCartMutation.isLoading,
    isUpdating: updateCartMutation.isLoading,
    isRemoving: removeFromCartMutation.isLoading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
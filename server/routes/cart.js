import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id })
      .populate('items.product');

    if (!cart) {
      return res.json([]);
    }

 
    const cartItems = cart.items.map(item => ({
      id: item._id,
      customerId: req.user._id,
      productId: item.product._id,
      quantity: item.quantity,
      product: item.product,
    }));

    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: error.message });
  }
});


router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

  
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

  
    let cart = await Cart.findOne({ customer: req.user._id });
    
    if (!cart) {
      cart = new Cart({ customer: req.user._id, items: [] });
    }

    
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    
    const updatedItem = existingItemIndex > -1 
      ? cart.items[existingItemIndex]
      : cart.items[cart.items.length - 1];

    res.status(201).json({
      id: updatedItem._id,
      customerId: req.user._id,
      productId: updatedItem.product._id,
      quantity: updatedItem.quantity,
      product: updatedItem.product,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).json({ message: error.message });
  }
});


router.put('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json({
      id: item._id,
      customerId: req.user._id,
      productId: item.product._id,
      quantity: item.quantity,
      product: item.product,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(400).json({ message: error.message });
  }
});


router.delete('/:itemId', protect, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull({ _id: itemId });
    await cart.save();

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: error.message });
  }
});


router.delete('/', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { customer: req.user._id },
      { $set: { items: [] } }
    );

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
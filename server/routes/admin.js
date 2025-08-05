import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();


router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalProducts, totalCustomers, totalOrders, totalRevenue] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer', isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/customers', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    
    let query = { role: 'customer' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'blocked') {
      query.isActive = false;
    }

    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      customers,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/customers/:id', protect, adminOnly, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Order.find({ customer: req.params.id })
      .populate('orderItems.product')
      .sort({ createdAt: -1 });

    res.json({
      customer,
      orders,
      stats: {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
      }
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({ message: error.message });
  }
});


router.put('/customers/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;

    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
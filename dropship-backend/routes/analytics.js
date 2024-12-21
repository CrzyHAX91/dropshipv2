const express = require('express');
const router = express.Router();

// Mock data for analytics
const analyticsData = {
  revenue: { value: 10000, trend: 5 },
  orders: { value: 200, trend: -2 },
  customers: { value: 150, trend: 10 },
  conversion: { value: 2.5, trend: 0.5 },
  topProducts: [
    { id: 1, name: 'Product A', revenue: 5000, orders: 100, trend: 10 },
    { id: 2, name: 'Product B', revenue: 3000, orders: 50, trend: -5 },
    { id: 3, name: 'Product C', revenue: 2000, orders: 30, trend: 15 },
  ],
  customerSegments: [
    { id: 1, name: 'Segment A', customers: 100, revenue: 6000, growth: 5 },
    { id: 2, name: 'Segment B', customers: 50, revenue: 3000, growth: -2 },
  ],
};

// Get analytics data
router.get('/', (req, res) => {
  const period = req.query.period || 'month'; // Example: 'day', 'week', 'month', etc.
  // Here you would typically fetch data from a database based on the period
  res.json(analyticsData);
});

module.exports = router;

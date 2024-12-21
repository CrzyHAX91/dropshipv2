const express = require('express');
const router = express.Router();

// Mock data for AliExpress products
const aliexpressProducts = [
  { id: 1, name: 'Product A', price: 20.99 },
  { id: 2, name: 'Product B', price: 15.49 },
];

// Get AliExpress products
router.get('/', (req, res) => {
  res.json(aliexpressProducts);
});

// Add a product to AliExpress
router.post('/add', (req, res) => {
  const newProduct = req.body;
  // Logic to add product to AliExpress
  aliexpressProducts.push(newProduct);
  res.status(201).json({ message: 'Product added successfully', product: newProduct });
});

// Sync products with AliExpress
router.post('/sync', (req, res) => {
  // Logic to sync products
  res.json({ message: 'Products synced successfully' });
});

module.exports = router;

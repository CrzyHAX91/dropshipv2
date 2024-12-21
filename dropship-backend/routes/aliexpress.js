const express = require('express');
const router = express.Router();
const logger = require('../logger');
const aliexpressSync = require('../services/aliexpressSync');
const dropshippingService = require('../services/dropshippingService');

// Search AliExpress products
router.get('/search', async (req, res) => {
    try {
        const { query, page = 1, pageSize = 20, sort } = req.query;
        const products = await aliexpressSync.searchProducts(query, {
            page,
            pageSize,
            sort
        });

        // Add profitable prices
        const productsWithPrices = products.map(product => ({
            ...product,
            price: dropshippingService.calculateProfitablePrice(product.originalPrice, product.shippingCost)
        }));

        res.json(productsWithPrices);
    } catch (error) {
        logger.error('Error searching products:', error);
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const products = await aliexpressSync.syncCategory(req.params.categoryId, {
            page,
            pageSize
        });

        const productsWithPrices = products.map(product => ({
            ...product,
            price: dropshippingService.calculateProfitablePrice(product.originalPrice, product.shippingCost)
        }));

        res.json(productsWithPrices);
    } catch (error) {
        logger.error('Error fetching category products:', error);
        res.status(500).json({ message: 'Error fetching category products', error: error.message });
    }
});

// Get product details
router.get('/product/:id', async (req, res) => {
    try {
        const product = await aliexpressSync.getProductDetails(req.params.id);
        product.price = dropshippingService.calculateProfitablePrice(
            product.originalPrice,
            product.shippingCost
        );
        res.json(product);
    } catch (error) {
        logger.error('Error fetching product details:', error);
        res.status(500).json({ message: 'Error fetching product details', error: error.message });
    }
});

// Sync top products
router.post('/sync/top', async (req, res) => {
    try {
        const { pageSize = 50 } = req.body;
        const products = await aliexpressSync.syncTopProducts({ pageSize });
        res.json({
            message: 'Top products synced successfully',
            count: products.length,
            products
        });
    } catch (error) {
        logger.error('Error syncing top products:', error);
        res.status(500).json({ message: 'Error syncing top products', error: error.message });
    }
});

// Manual sync for specific category
router.post('/sync/category/:categoryId', async (req, res) => {
    try {
        const { pageSize = 50 } = req.body;
        const products = await aliexpressSync.syncCategory(req.params.categoryId, { pageSize });
        res.json({
            message: 'Category products synced successfully',
            count: products.length,
            products
        });
    } catch (error) {
        logger.error('Error syncing category products:', error);
        res.status(500).json({ message: 'Error syncing category products', error: error.message });
    }
});

// Get available categories
router.get('/categories', (req, res) => {
    try {
        const categories = aliexpressSync.categories;
        res.json(categories);
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

module.exports = router;

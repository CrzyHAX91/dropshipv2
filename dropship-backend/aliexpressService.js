const axios = require('axios');
const logger = require('./logger');

// AliExpress API configuration
const API_KEY = '50000601c30atpedfgu3LVvik87Ixlsvle3mSoB7701ceb156fPunYZ43GBg';
const BASE_URL = 'https://api.aliexpress.com/v2/';

// Function to fetch product listings with mock data for development
const fetchProductListings = async () => {
    try {
        // For development, return mock data since we don't have full API access
        const mockProducts = [
            {
                id: 1,
                name: "Wireless Headphones",
                description: "High-quality wireless headphones with noise cancellation",
                price: 59.99,
                image: "headphones.jpg"
            },
            {
                id: 2,
                name: "Smartphone",
                description: "Latest model smartphone with advanced features",
                price: 699.99,
                image: "smartphone.jpg"
            },
            {
                id: 3,
                name: "Laptop",
                description: "Powerful laptop for work and gaming",
                price: 999.99,
                image: "laptop.jpg"
            }
        ];
        
        logger.info(`Returning ${mockProducts.length} mock products`);
        return mockProducts;
    } catch (error) {
        console.error('Error fetching product listings:', error);
        throw error;
    }
};

// Function to create an order
const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${BASE_URL}/orders`, orderData, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

module.exports = {
    fetchProductListings,
    createOrder,
};

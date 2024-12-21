import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import uiService from '../services/uiService';

const TopProducts = () => {
    const [topProducts, setTopProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [websocket, setWebsocket] = useState(null);

    useEffect(() => {
        // Initial fetch of top products
        fetchTopProducts();

        // Set up WebSocket connection for real-time updates
        const ws = new WebSocket('ws://localhost:3000');
        setWebsocket(ws);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'topProducts') {
                updateTopProducts(data.products);
            }
        };

        // Cleanup WebSocket connection
        return () => {
            if (ws) ws.close();
        };
    }, []);

    const fetchTopProducts = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/products/top', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch top products');

            const data = await response.json();
            setTopProducts(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching top products:', error);
            setIsLoading(false);
        }
    };

    const updateTopProducts = (newProducts) => {
        setTopProducts(prevProducts => {
            // Update only if there are changes
            const hasChanges = JSON.stringify(prevProducts) !== JSON.stringify(newProducts);
            if (hasChanges) {
                // Animate the changes
                return newProducts.map((product, index) => ({
                    ...product,
                    animate: prevProducts[index]?.id !== product.id
                }));
            }
            return prevProducts;
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6" style={uiService.getGradientText('Top Selling Products')}>
                Top Selling Products
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={product.animate ? { scale: 0.8, opacity: 0 } : false}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="relative">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 right-2">
                                <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                                    #{index + 1} Best Seller
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                            
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl font-bold text-blue-600">
                                    ${product.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {product.soldCount} sold
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <i className="fas fa-star text-yellow-400 mr-1"></i>
                                    <span>{product.rating} ({product.reviewCount} reviews)</span>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-600">
                                    <i className="fas fa-box text-blue-400 mr-1"></i>
                                    <span>{product.stock} in stock</span>
                                </div>

                                {product.trending && (
                                    <div className="flex items-center text-sm text-green-600">
                                        <i className="fas fa-chart-line mr-1"></i>
                                        <span>Trending</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    Add to Store
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <i className="fas fa-heart"></i>
                                </motion.button>
                            </div>
                        </div>

                        {/* Real-time updates indicator */}
                        {product.animate && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5 }}
                                className="absolute inset-0 bg-blue-500 opacity-10 pointer-events-none"
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Real-time update indicator */}
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <i className="fas fa-sync-alt animate-spin mr-2"></i>
                Real-time updates enabled
            </div>
        </div>
    );
};

export default TopProducts;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import uiService from '../services/uiService';
import TopProducts from '../components/TopProducts';

const Home = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [stats, setStats] = useState({
        products: 0,
        customers: 0,
        orders: 0,
        revenue: 0
    });

    useEffect(() => {
        // Simulate data loading
        setTimeout(() => {
            setFeaturedProducts([
                { id: 1, name: 'Premium Headphones', price: 199.99, image: '/images/headphones.jpg' },
                { id: 2, name: 'Smart Watch', price: 299.99, image: '/images/smartwatch.jpg' },
                { id: 3, name: 'Wireless Earbuds', price: 149.99, image: '/images/earbuds.jpg' }
            ]);
            setStats({
                products: 1500,
                customers: 5000,
                orders: 10000,
                revenue: 500000
            });
            setIsLoading(false);
        }, 1000);
    }, []);

    const Container = uiService.getLayout('container');
    const Section = uiService.getLayout('section');
    const Card = uiService.getLayout('card');

    return (
        <Container
            initial="initial"
            animate="animate"
            variants={uiService.getAnimation('stagger')}
            className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50"
        >
            {/* Hero Section */}
            <Section
                variants={uiService.getAnimation('fadeIn')}
                className="relative h-screen flex items-center justify-center text-center px-4"
            >
                <motion.div
                    variants={uiService.getAnimation('slideUp')}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-6xl font-bold mb-6" style={uiService.getGradientText('Dropship Revolution')}>
                        Transform Your E-commerce Business
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Harness the power of AI-driven automation to scale your dropshipping business
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Get Started Now
                    </motion.button>
                </motion.div>

                {/* Animated background elements */}
                <motion.div
                    className="absolute inset-0 -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </motion.div>
            </Section>

            {/* Stats Section */}
            <Section
                variants={uiService.getAnimation('fadeIn')}
                className="py-20 bg-white"
            >
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {Object.entries(stats).map(([key, value], index) => (
                            <Card
                                key={key}
                                variants={uiService.getAnimation('scale')}
                                className="bg-white p-6 rounded-2xl shadow-lg text-center"
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-4xl font-bold mb-2"
                                    style={uiService.getGradientText(
                                        key === 'revenue' ? `$${value.toLocaleString()}` : value.toLocaleString()
                                    )}
                                >
                                    {key === 'revenue' ? `$${value.toLocaleString()}` : value.toLocaleString()}
                                </motion.div>
                                <p className="text-gray-600 capitalize">{key}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Top Products Section */}
            <Section
                variants={uiService.getAnimation('fadeIn')}
                className="py-20"
            >
                <div className="container mx-auto px-4">
                    <TopProducts />
                </div>
            </Section>

            {/* Featured Products */}
            <Section
                variants={uiService.getAnimation('fadeIn')}
                className="py-20 bg-gray-50"
            >
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12" style={uiService.getGradientText('Featured Products')}>
                        Featured Products
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredProducts.map((product, index) => (
                            <Card
                                key={product.id}
                                variants={uiService.getAnimation('scale')}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden"
                                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                            >
                                <motion.img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                    initial={{ scale: 1.2 }}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                    <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold"
                                    >
                                        View Details
                                    </motion.button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Features Section */}
            <Section
                variants={uiService.getAnimation('fadeIn')}
                className="py-20 bg-white"
            >
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12" style={uiService.getGradientText('Why Choose Us')}>
                        Why Choose Us
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: '🤖', title: 'AI-Powered Automation', description: 'Leverage advanced AI to automate your business processes' },
                            { icon: '📊', title: 'Real-time Analytics', description: 'Make data-driven decisions with real-time insights' },
                            { icon: '🛡️', title: 'Enhanced Security', description: 'Enterprise-grade security to protect your business' }
                        ].map((feature, index) => (
                            <Card
                                key={index}
                                variants={uiService.getAnimation('scale')}
                                className="bg-white p-6 rounded-2xl shadow-lg text-center"
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>

            {/* CTA Section */}
            <Section
                variants={uiService.getAnimation('fadeIn')}
                className="py-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            >
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
                    <p className="text-xl mb-8 opacity-90">Join thousands of successful entrepreneurs today</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Start Free Trial
                    </motion.button>
                </div>
            </Section>
        </Container>
    );
};

export default Home;

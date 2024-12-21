import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Creative Shop</h3>
                        <p className="text-gray-400">Your one-stop dropshipping solution for quality products and reliable service.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><button onClick={() => document.getElementById('featured').scrollIntoView()} className="text-gray-400 hover:text-white">Featured Products</button></li>
                            <li><button onClick={() => document.getElementById('products').scrollIntoView()} className="text-gray-400 hover:text-white">All Products</button></li>
                            <li><button onClick={() => document.getElementById('about').scrollIntoView()} className="text-gray-400 hover:text-white">About Us</button></li>
                            <li><button onClick={() => document.getElementById('contact').scrollIntoView()} className="text-gray-400 hover:text-white">Contact</button></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact Info</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Email: info@creativeshop.com</li>
                            <li>Phone: (555) 123-4567</li>
                            <li>Address: 123 Commerce St, Suite 100</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-400">&copy; 2023 Creative Shop. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

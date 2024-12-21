import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="bg-image py-4 relative">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div>
                        <Link to="/" className="text-white text-3xl font-bold flex items-center">
                            <i className="fas fa-box-open mr-2"></i>
                            DropShop
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <Navigation />

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            className="btn btn-ghost text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 shadow-lg py-4 px-4 z-50">
                        <div className="flex flex-col space-y-4">
                            <Link 
                                to="/dashboard" 
                                className="text-white hover:text-pink-400 flex items-center"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <i className="fas fa-chart-line mr-2"></i>
                                Dashboard
                            </Link>
                            <Link 
                                to="/products" 
                                className="text-white hover:text-pink-400 flex items-center"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <i className="fas fa-store mr-2"></i>
                                Products
                            </Link>
                            <div className="flex flex-col space-y-2">
                                <span className="badge badge-success inline-flex items-center w-fit">
                                    <i className="fas fa-robot mr-1"></i>
                                    Automated
                                </span>
                                <button className="btn btn-primary btn-gradient rounded-full w-full">
                                    <i className="fas fa-user mr-2"></i>
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

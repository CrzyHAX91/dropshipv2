import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav className="hidden md:flex items-center space-x-6">
            <Link 
                to="/dashboard" 
                className="text-white hover:text-pink-400 flex items-center"
            >
                <i className="fas fa-chart-line mr-2"></i>
                Dashboard
            </Link>
            <Link 
                to="/products" 
                className="text-white hover:text-pink-400 flex items-center"
            >
                <i className="fas fa-store mr-2"></i>
                Products
            </Link>
            <div className="flex items-center space-x-3">
                <span className="badge badge-success">
                    <i className="fas fa-robot mr-1"></i>
                    Automated
                </span>
                <button className="btn btn-primary btn-gradient rounded-full">
                    <i className="fas fa-user mr-2"></i>
                    Login
                </button>
            </div>
        </nav>
    );
};

export default Navigation;

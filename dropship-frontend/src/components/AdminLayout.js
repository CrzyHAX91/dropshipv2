import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Generate breadcrumbs from current location
    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(path => path);
        return paths.map((path, index) => ({
            name: path.charAt(0).toUpperCase() + path.slice(1),
            path: '/' + paths.slice(0, index + 1).join('/')
        }));
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Admin Header */}
            <div className="bg-base-100 shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="navbar min-h-16">
                        <div className="flex-1 gap-4">
                            <button 
                                className="btn btn-ghost btn-circle"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            >
                                <i className="fas fa-bars text-xl"></i>
                            </button>
                            <Link to="/admin" className="text-xl font-bold hidden md:flex items-center">
                                <i className="fas fa-user-shield mr-2"></i>
                                Admin Panel
                            </Link>
                            {/* Search Bar */}
                            <div className="form-control flex-1 max-w-xs">
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        placeholder="Search..." 
                                        className="input input-bordered w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button className="btn btn-square">
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-none gap-2">
                            {/* Notifications */}
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-circle">
                                    <div className="indicator">
                                        <i className="fas fa-bell text-xl"></i>
                                        <span className="badge badge-sm badge-primary indicator-item">3</span>
                                    </div>
                                </label>
                                <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow">
                                    <div className="card-body">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-lg">Notifications</span>
                                            <button className="btn btn-ghost btn-xs">Mark all as read</button>
                                        </div>
                                        <ul className="menu bg-base-100 w-full p-0">
                                            <li>
                                                <a className="py-3 px-4 hover:bg-base-200">
                                                    <div>
                                                        <p className="font-semibold">New Order #1234</p>
                                                        <p className="text-sm opacity-70">2 minutes ago</p>
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <a className="py-3 px-4 hover:bg-base-200">
                                                    <div>
                                                        <p className="font-semibold">Low Stock Alert</p>
                                                        <p className="text-sm opacity-70">1 hour ago</p>
                                                    </div>
                                                </a>
                                            </li>
                                        </ul>
                                        <div className="card-actions">
                                            <Link to="/admin/notifications" className="btn btn-primary btn-block">View All</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* User Menu */}
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                    <div className="w-10 rounded-full">
                                        <i className="fas fa-user text-xl"></i>
                                    </div>
                                </label>
                                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <Link to="/admin/profile">
                                            <i className="fas fa-user-circle"></i>
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/settings">
                                            <i className="fas fa-cog"></i>
                                            Settings
                                        </Link>
                                    </li>
                                    <div className="divider my-0"></div>
                                    <li>
                                        <button className="text-error">
                                            <i className="fas fa-sign-out-alt"></i>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-base-100 border-b">
                <div className="container mx-auto px-4">
                    <div className="text-sm breadcrumbs py-3">
                        <ul>
                            {breadcrumbs.map((crumb, index) => (
                                <li key={index}>
                                    <Link to={crumb.path}>{crumb.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className={`${sidebarCollapsed ? 'hidden' : 'col-span-12 md:col-span-3'} transition-all duration-300 ease-in-out`}>
                        <div className="bg-base-100 rounded-box shadow-lg">
                            {/* Navigation Menu */}
                            <div className="p-4">
                                <ul className="menu menu-lg w-full">
                                    <li>
                                        <Link 
                                            to="/admin" 
                                            className={location.pathname === '/admin' ? 'active' : ''}
                                        >
                                            <i className="fas fa-tachometer-alt"></i>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li className="menu-title">
                                        <span>Sales</span>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/admin/orders"
                                            className={location.pathname === '/admin/orders' ? 'active' : ''}
                                        >
                                            <i className="fas fa-shopping-cart"></i>
                                            Orders
                                        </Link>
                                    </li>
                                    <li>
                                        <details>
                                            <summary>
                                                <i className="fas fa-boxes"></i>
                                                Products
                                            </summary>
                                            <ul>
                                                <li>
                                                    <Link to="/admin/products">All Products</Link>
                                                </li>
                                                <li>
                                                    <Link to="/admin/products/categories">Categories</Link>
                                                </li>
                                                <li>
                                                    <Link to="/admin/products/inventory">Inventory</Link>
                                                </li>
                                            </ul>
                                        </details>
                                    </li>
                                    <li className="menu-title">
                                        <span>Analytics</span>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/admin/analytics"
                                            className={location.pathname === '/admin/analytics' ? 'active' : ''}
                                        >
                                            <i className="fas fa-chart-bar"></i>
                                            Reports
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/admin/customers"
                                            className={location.pathname === '/admin/customers' ? 'active' : ''}
                                        >
                                            <i className="fas fa-users"></i>
                                            Customers
                                        </Link>
                                    </li>
                                    <li className="menu-title">
                                        <span>System</span>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/admin/data"
                                            className={location.pathname === '/admin/data' ? 'active' : ''}
                                        >
                                            <i className="fas fa-database"></i>
                                            Data Management
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/admin/settings"
                                            className={location.pathname === '/admin/settings' ? 'active' : ''}
                                        >
                                            <i className="fas fa-cog"></i>
                                            Settings
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Quick Stats */}
                            <div className="p-4 border-t">
                                <h3 className="font-bold mb-4">Quick Stats</h3>
                                <div className="stats stats-vertical shadow w-full">
                                    <div className="stat">
                                        <div className="stat-title">Today's Orders</div>
                                        <div className="stat-value text-primary">25</div>
                                        <div className="stat-desc">↗︎ 12 (15%)</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Pending Shipments</div>
                                        <div className="stat-value text-secondary">12</div>
                                        <div className="stat-desc">↘︎ 3 (5%)</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Revenue Today</div>
                                        <div className="stat-value text-accent">$2,450</div>
                                        <div className="stat-desc">↗︎ $350 (14%)</div>
                                    </div>
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="p-4 border-t">
                                <h3 className="font-bold mb-4">System Status</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span>API Status</span>
                                        <span className="badge badge-success gap-1">
                                            <i className="fas fa-check-circle"></i>
                                            Operational
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Last Sync</span>
                                        <span className="text-sm opacity-70">5 mins ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={`${sidebarCollapsed ? 'col-span-12' : 'col-span-12 md:col-span-9'} transition-all duration-300 ease-in-out`}>
                        <div className="bg-base-100 rounded-box shadow-lg p-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
                <div>
                    <p>Copyright © 2024 - All rights reserved by Dropship Admin</p>
                </div>
            </footer>
        </div>
    );
};

export default AdminLayout;

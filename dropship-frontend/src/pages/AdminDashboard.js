import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [realTimeStats, setRealTimeStats] = useState({
        activeUsers: 0,
        recentOrders: [],
        salesVelocity: 0,
        topProducts: []
    });
    
    const ws = useRef(null);

    // Initialize WebSocket connection
    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3000');

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            // Subscribe to relevant topics
            ws.current.send(JSON.stringify({
                type: 'subscribe',
                topics: ['sales', 'inventory', 'analytics']
            }));
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            toast.error('Real-time connection error');
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                if (ws.current) {
                    ws.current.close();
                }
                initializeWebSocket();
            }, 5000);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const handleWebSocketMessage = (message) => {
        switch (message.type) {
            case 'sale':
                // Handle new sale notification
                toast.success(`New order: $${message.data.amount} from ${message.data.customer}`);
                fetchOrders(); // Refresh orders list
                break;

            case 'inventory_alert':
                // Handle inventory alerts
                message.data.items.forEach(item => {
                    toast.warning(`Low stock alert: ${item.name} (${item.stock} remaining)`);
                });
                break;

            case 'analytics_update':
                // Update real-time statistics
                setRealTimeStats(message.data);
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/stats/profit');
            if (!response.ok) throw new Error('Failed to fetch statistics');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
            toast.error('Error fetching statistics');
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/orders');
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
            toast.error('Error fetching orders');
        }
    };

    useEffect(() => {
        fetchStats();
        fetchOrders();
        fetchRealTimeAnalytics();
    }, []);

    const fetchRealTimeAnalytics = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/analytics/realtime');
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const data = await response.json();
            setRealTimeStats(data);
        } catch (err) {
            console.error('Error fetching real-time analytics:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gradient">Admin Dashboard</h1>

            {/* Real-time Status Bar */}
            <div className="bg-base-200 p-4 rounded-box mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="badge badge-success gap-2">
                            <span className="animate-pulse">●</span> Live
                        </div>
                        <span className="text-sm">
                            {realTimeStats.activeUsers} active users
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">
                            Sales Velocity: ${realTimeStats.salesVelocity}/hour
                        </span>
                        <span className="text-sm">
                            Recent Orders: {realTimeStats.recentOrders.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tabs tabs-boxed justify-center mb-8">
                <button 
                    className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders
                </button>
                <button 
                    className={`tab ${activeTab === 'inventory' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    Inventory
                </button>
                <button 
                    className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="stat bg-base-100 shadow rounded-box">
                        <div className="stat-title">Total Revenue</div>
                        <div className="stat-value text-primary">${stats?.total.toFixed(2)}</div>
                        <div className="stat-desc">All time</div>
                    </div>
                    <div className="stat bg-base-100 shadow rounded-box">
                        <div className="stat-title">Active Orders</div>
                        <div className="stat-value text-secondary">
                            {orders.filter(order => order.status === 'processing').length}
                        </div>
                        <div className="stat-desc">Being processed</div>
                    </div>
                    <div className="stat bg-base-100 shadow rounded-box">
                        <div className="stat-title">Today's Profit</div>
                        <div className="stat-value text-accent">
                            ${stats?.daily[new Date().toISOString().split('T')[0]]?.toFixed(2) || '0.00'}
                        </div>
                        <div className="stat-desc">Last 24 hours</div>
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Tracking</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.orderId} className="hover">
                                    <td>{order.orderId}</td>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.items.length} items</td>
                                    <td>${order.total.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${
                                            order.status === 'completed' ? 'badge-success' :
                                            order.status === 'processing' ? 'badge-warning' :
                                            'badge-error'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        {order.trackingNumber ? (
                                            <a 
                                                href={`https://track.aliexpress.com/${order.trackingNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link link-primary"
                                            >
                                                {order.trackingNumber}
                                            </a>
                                        ) : (
                                            'Pending'
                                        )}
                                    </td>
                                    <td>
                                        <div className="dropdown dropdown-end">
                                            <label tabIndex={0} className="btn btn-ghost btn-xs">
                                                <i className="fas fa-ellipsis-v"></i>
                                            </label>
                                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                                <li><a>View Details</a></li>
                                                <li><a>Contact Customer</a></li>
                                                <li><a>Cancel Order</a></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="grid gap-6">
                    {/* Top Products */}
                    <div className="bg-base-100 p-6 rounded-box shadow">
                        <h3 className="text-xl font-bold mb-4">Top Products</h3>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Sales</th>
                                        <th>Revenue</th>
                                        <th>Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {realTimeStats.topProducts.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.name}</td>
                                            <td>{product.sales}</td>
                                            <td>${product.revenue.toFixed(2)}</td>
                                            <td>
                                                <span className={`text-${product.trend > 0 ? 'success' : 'error'}`}>
                                                    {product.trend > 0 ? '↑' : '↓'} {Math.abs(product.trend)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-base-100 p-6 rounded-box shadow">
                        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {realTimeStats.recentOrders.map((order, index) => (
                                <div key={index} className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                                    <div>
                                        <p className="font-semibold">Order #{order.orderId}</p>
                                        <p className="text-sm opacity-70">{order.customer}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">${order.total.toFixed(2)}</p>
                                        <p className="text-sm opacity-70">
                                            {new Date(order.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-error shadow-lg">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

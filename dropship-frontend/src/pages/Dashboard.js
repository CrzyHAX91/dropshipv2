import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/stats/profit');
            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }
            const data = await response.json();
            setStats(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error shadow-lg max-w-2xl mx-auto">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gradient">Business Dashboard</h1>
            
            {/* Profit Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-title">Total Profit</div>
                    <div className="stat-value text-primary">${stats?.total.toFixed(2)}</div>
                    <div className="stat-desc">Since starting</div>
                </div>
                
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-title">Monthly Profit</div>
                    <div className="stat-value text-secondary">
                        ${Object.values(stats?.monthly || {}).pop()?.toFixed(2) || '0.00'}
                    </div>
                    <div className="stat-desc">Current month</div>
                </div>
                
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-title">Average Order Profit</div>
                    <div className="stat-value text-accent">${stats?.averageOrderProfit.toFixed(2)}</div>
                    <div className="stat-desc">Per order</div>
                </div>
            </div>

            {/* Automation Status */}
            <div className="bg-base-100 shadow rounded-box p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Automation Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <div className="badge badge-success badge-lg">Active</div>
                        <span>Order Processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="badge badge-success badge-lg">Active</div>
                        <span>Inventory Sync</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="badge badge-success badge-lg">Active</div>
                        <span>Price Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="badge badge-success badge-lg">Active</div>
                        <span>Profit Tracking</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-base-100 shadow rounded-box p-6">
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Details</th>
                                <th>Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(stats?.daily || {}).reverse().slice(0, 5).map(([date, profit]) => (
                                <tr key={date}>
                                    <td>{new Date(date).toLocaleDateString()}</td>
                                    <td>Sales</td>
                                    <td>Daily Summary</td>
                                    <td className="text-success">${profit.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

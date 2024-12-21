import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'react-toastify';

const Analytics = () => {
    const [reportType, setReportType] = useState('sales');
    const [timeFrame, setTimeFrame] = useState('monthly');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [exportFormat, setExportFormat] = useState('csv');

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        fetchReportData();
    }, [reportType, timeFrame]);

    const fetchReportData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3000/api/analytics/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: reportType,
                    timeFrame,
                    ...customDateRange
                })
            });

            if (!response.ok) throw new Error('Failed to fetch report data');

            const data = await response.json();
            setReportData(data);
        } catch (error) {
            toast.error('Error fetching report data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/analytics/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: reportType,
                    format: exportFormat,
                    data: reportData
                })
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Report exported successfully');
        } catch (error) {
            toast.error('Export failed: ' + error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <select 
                    className="select select-bordered w-full"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                >
                    <option value="sales">Sales Analytics</option>
                    <option value="inventory">Inventory Analytics</option>
                    <option value="customers">Customer Analytics</option>
                    <option value="products">Product Analytics</option>
                    <option value="marketing">Marketing Analytics</option>
                    <option value="financial">Financial Analytics</option>
                </select>

                <select 
                    className="select select-bordered w-full"
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom Range</option>
                </select>

                {timeFrame === 'custom' && (
                    <>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={customDateRange.startDate}
                            onChange={(e) => setCustomDateRange({
                                ...customDateRange,
                                startDate: e.target.value
                            })}
                        />
                        <input
                            type="date"
                            className="input input-bordered"
                            value={customDateRange.endDate}
                            onChange={(e) => setCustomDateRange({
                                ...customDateRange,
                                endDate: e.target.value
                            })}
                        />
                    </>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-8">
                <button 
                    className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab ${activeTab === 'details' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Detailed Analysis
                </button>
                <button 
                    className={`tab ${activeTab === 'trends' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('trends')}
                >
                    Trends
                </button>
                <button 
                    className={`tab ${activeTab === 'predictions' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('predictions')}
                >
                    Predictions
                </button>
            </div>

            {reportData && (
                <div className="grid grid-cols-1 gap-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {reportData.summary.metrics.map((metric, index) => (
                                    <div key={index} className="stat bg-base-100 shadow rounded-box">
                                        <div className="stat-title">{metric.label}</div>
                                        <div className="stat-value text-primary">{metric.value}</div>
                                        <div className="stat-desc">
                                            {metric.change > 0 ? '↗︎' : '↘︎'} {Math.abs(metric.change)}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Main Chart */}
                            <div className="bg-base-100 p-6 rounded-box shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Trend Overview</h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={reportData.overview.trendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke="#8884d8" 
                                                activeDot={{ r: 8 }} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Detailed Analysis Tab */}
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bar Chart */}
                            <div className="bg-base-100 p-6 rounded-box shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Detailed Breakdown</h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.details.breakdownData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Pie Chart */}
                            <div className="bg-base-100 p-6 rounded-box shadow-lg">
                                <h3 className="text-xl font-bold mb-4">Distribution</h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={reportData.details.distributionData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                label
                                            >
                                                {reportData.details.distributionData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]} 
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Export Controls */}
                    <div className="flex justify-end gap-4 mt-8">
                        <select 
                            className="select select-bordered"
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                        >
                            <option value="csv">CSV</option>
                            <option value="excel">Excel</option>
                            <option value="pdf">PDF</option>
                            <option value="json">JSON</option>
                        </select>
                        <button 
                            className="btn btn-primary"
                            onClick={handleExport}
                        >
                            Export Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;

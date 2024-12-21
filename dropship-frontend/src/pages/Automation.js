import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Automation = () => {
    const [activeTab, setActiveTab] = useState('pricing');
    const [rules, setRules] = useState({
        pricing: [],
        inventory: [],
        email: [],
        marketing: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [newRule, setNewRule] = useState({
        type: '',
        name: '',
        conditions: [],
        actions: []
    });
    const [automationStatus, setAutomationStatus] = useState({
        pricing: false,
        inventory: false,
        email: false,
        marketing: false
    });

    useEffect(() => {
        fetchRules();
        fetchAutomationStatus();
    }, []);

    const fetchRules = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3000/api/automation/rules', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch rules');

            const data = await response.json();
            setRules(data);
        } catch (error) {
            toast.error('Error fetching automation rules: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAutomationStatus = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/automation/status', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch automation status');

            const data = await response.json();
            setAutomationStatus(data);
        } catch (error) {
            toast.error('Error fetching automation status: ' + error.message);
        }
    };

    const handleAddRule = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/automation/rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newRule)
            });

            if (!response.ok) throw new Error('Failed to add rule');

            const data = await response.json();
            setRules(prev => ({
                ...prev,
                [newRule.type]: [...prev[newRule.type], data.rule]
            }));

            toast.success('Rule added successfully');
            setNewRule({ type: '', name: '', conditions: [], actions: [] });
        } catch (error) {
            toast.error('Error adding rule: ' + error.message);
        }
    };

    const toggleAutomation = async (type) => {
        try {
            const response = await fetch(`http://localhost:3000/api/automation/${type}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to toggle automation');

            const data = await response.json();
            setAutomationStatus(prev => ({
                ...prev,
                [type]: data.status
            }));

            toast.success(`${type} automation ${data.status ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Error toggling automation: ' + error.message);
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
            <h1 className="text-3xl font-bold mb-8">Automation Settings</h1>

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-8">
                <button 
                    className={`tab ${activeTab === 'pricing' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('pricing')}
                >
                    Pricing Automation
                </button>
                <button 
                    className={`tab ${activeTab === 'inventory' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    Inventory Automation
                </button>
                <button 
                    className={`tab ${activeTab === 'email' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('email')}
                >
                    Email Automation
                </button>
                <button 
                    className={`tab ${activeTab === 'marketing' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('marketing')}
                >
                    Marketing Automation
                </button>
            </div>

            {/* Status Toggle */}
            <div className="card bg-base-100 shadow-xl mb-8">
                <div className="card-body">
                    <div className="flex justify-between items-center">
                        <h2 className="card-title">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Automation Status
                        </h2>
                        <label className="swap">
                            <input 
                                type="checkbox" 
                                checked={automationStatus[activeTab]}
                                onChange={() => toggleAutomation(activeTab)}
                            />
                            <div className="swap-on">Enabled</div>
                            <div className="swap-off">Disabled</div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Rules List */}
            <div className="card bg-base-100 shadow-xl mb-8">
                <div className="card-body">
                    <h2 className="card-title mb-4">Active Rules</h2>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Rule Name</th>
                                    <th>Conditions</th>
                                    <th>Actions</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules[activeTab].map((rule, index) => (
                                    <tr key={index}>
                                        <td>{rule.name}</td>
                                        <td>{rule.conditions.length} conditions</td>
                                        <td>{rule.actions.length} actions</td>
                                        <td>
                                            <span className={`badge ${rule.active ? 'badge-success' : 'badge-error'}`}>
                                                {rule.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn btn-sm btn-ghost">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-sm btn-ghost text-error">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add New Rule */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title mb-4">Add New Rule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Rule Name</span>
                            </label>
                            <input 
                                type="text"
                                className="input input-bordered"
                                value={newRule.name}
                                onChange={(e) => setNewRule({
                                    ...newRule,
                                    name: e.target.value
                                })}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Rule Type</span>
                            </label>
                            <select 
                                className="select select-bordered"
                                value={newRule.type}
                                onChange={(e) => setNewRule({
                                    ...newRule,
                                    type: e.target.value
                                })}
                            >
                                <option value="">Select Type</option>
                                <option value="pricing">Pricing</option>
                                <option value="inventory">Inventory</option>
                                <option value="email">Email</option>
                                <option value="marketing">Marketing</option>
                            </select>
                        </div>
                    </div>

                    {/* Conditions Builder */}
                    <div className="mt-4">
                        <h3 className="font-bold mb-2">Conditions</h3>
                        {/* Add condition builder UI here */}
                    </div>

                    {/* Actions Builder */}
                    <div className="mt-4">
                        <h3 className="font-bold mb-2">Actions</h3>
                        {/* Add actions builder UI here */}
                    </div>

                    <div className="card-actions justify-end mt-4">
                        <button 
                            className="btn btn-primary"
                            onClick={handleAddRule}
                            disabled={!newRule.name || !newRule.type}
                        >
                            Add Rule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Automation;

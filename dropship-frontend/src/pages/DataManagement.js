import React, { useState } from 'react';
import { toast } from 'react-toastify';

const DataManagement = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [exportType, setExportType] = useState('products');
    const [exportFormat, setExportFormat] = useState('csv');
    const [isLoading, setIsLoading] = useState(false);
    const [cleanupOptions, setCleanupOptions] = useState({
        removeInactiveCustomers: false,
        removeOldOrders: false,
        removeDeletedProducts: false,
        cleanupOrphanedData: false,
        inactiveDays: 365,
        orderAgeDays: 730
    });

    // Handle file upload
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Handle data export
    const handleExport = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:3000/api/data/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: exportType,
                    format: exportFormat
                })
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportType}_export.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Export completed successfully');
        } catch (error) {
            toast.error('Export failed: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle data import
    const handleImport = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to import');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', exportType);

        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3000/api/data/import', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Import failed');

            const result = await response.json();
            toast.success(`Import completed: ${result.success.length} records imported`);
            if (result.failures.length > 0) {
                toast.warning(`${result.failures.length} records failed to import`);
            }
        } catch (error) {
            toast.error('Import failed: ' + error.message);
        } finally {
            setIsLoading(false);
            setSelectedFile(null);
        }
    };

    // Handle backup creation
    const handleCreateBackup = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3000/api/data/backup', {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Backup failed');

            const result = await response.json();
            toast.success('Backup created successfully');
        } catch (error) {
            toast.error('Backup failed: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle data cleanup
    const handleCleanup = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3000/api/data/cleanup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanupOptions)
            });

            if (!response.ok) throw new Error('Cleanup failed');

            const result = await response.json();
            toast.success('Data cleanup completed successfully');
        } catch (error) {
            toast.error('Cleanup failed: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Data Management</h1>

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Export Data</h2>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Export Type</span>
                            </label>
                            <select 
                                className="select select-bordered"
                                value={exportType}
                                onChange={(e) => setExportType(e.target.value)}
                            >
                                <option value="products">Products</option>
                                <option value="orders">Orders</option>
                                <option value="customers">Customers</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Format</span>
                            </label>
                            <select 
                                className="select select-bordered"
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                            >
                                <option value="csv">CSV</option>
                                <option value="json">JSON</option>
                            </select>
                        </div>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={handleExport}
                            disabled={isLoading}
                        >
                            Export
                        </button>
                    </div>
                </div>

                {/* Import Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Import Data</h2>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Import Type</span>
                            </label>
                            <select 
                                className="select select-bordered"
                                value={exportType}
                                onChange={(e) => setExportType(e.target.value)}
                            >
                                <option value="products">Products</option>
                                <option value="orders">Orders</option>
                                <option value="customers">Customers</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">File</span>
                            </label>
                            <input 
                                type="file" 
                                className="file-input file-input-bordered w-full" 
                                accept=".csv,.json"
                                onChange={handleFileChange}
                            />
                        </div>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={handleImport}
                            disabled={isLoading || !selectedFile}
                        >
                            Import
                        </button>
                    </div>
                </div>

                {/* Backup Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Backup Management</h2>
                        <p className="text-sm opacity-70 mb-4">
                            Create a complete backup of all system data
                        </p>
                        <button 
                            className="btn btn-primary"
                            onClick={handleCreateBackup}
                            disabled={isLoading}
                        >
                            Create Backup
                        </button>
                    </div>
                </div>

                {/* Cleanup Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Data Cleanup</h2>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Remove Inactive Customers</span>
                                <input 
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={cleanupOptions.removeInactiveCustomers}
                                    onChange={(e) => setCleanupOptions({
                                        ...cleanupOptions,
                                        removeInactiveCustomers: e.target.checked
                                    })}
                                />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Remove Old Orders</span>
                                <input 
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={cleanupOptions.removeOldOrders}
                                    onChange={(e) => setCleanupOptions({
                                        ...cleanupOptions,
                                        removeOldOrders: e.target.checked
                                    })}
                                />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Remove Deleted Products</span>
                                <input 
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={cleanupOptions.removeDeletedProducts}
                                    onChange={(e) => setCleanupOptions({
                                        ...cleanupOptions,
                                        removeDeletedProducts: e.target.checked
                                    })}
                                />
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Cleanup Orphaned Data</span>
                                <input 
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={cleanupOptions.cleanupOrphanedData}
                                    onChange={(e) => setCleanupOptions({
                                        ...cleanupOptions,
                                        cleanupOrphanedData: e.target.checked
                                    })}
                                />
                            </label>
                        </div>
                        <div className="divider"></div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Inactive Days Threshold</span>
                            </label>
                            <input 
                                type="number"
                                className="input input-bordered"
                                value={cleanupOptions.inactiveDays}
                                onChange={(e) => setCleanupOptions({
                                    ...cleanupOptions,
                                    inactiveDays: parseInt(e.target.value)
                                })}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Order Age Threshold (days)</span>
                            </label>
                            <input 
                                type="number"
                                className="input input-bordered"
                                value={cleanupOptions.orderAgeDays}
                                onChange={(e) => setCleanupOptions({
                                    ...cleanupOptions,
                                    orderAgeDays: parseInt(e.target.value)
                                })}
                            />
                        </div>
                        <button 
                            className="btn btn-warning mt-4"
                            onClick={handleCleanup}
                            disabled={isLoading}
                        >
                            Start Cleanup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataManagement;

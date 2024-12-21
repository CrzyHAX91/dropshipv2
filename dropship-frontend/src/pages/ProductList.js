import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState({});
    const [filters, setFilters] = useState({
        priceRange: { min: 0, max: 1000 },
        rating: 0,
        maxShippingDays: 30,
        inStock: true
    });
    const [showFilters, setShowFilters] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:3000/api/aliexpress';

            if (searchQuery) {
                url += `/search?query=${encodeURIComponent(searchQuery)}`;
            } else if (selectedCategory) {
                url += `/category/${selectedCategory}`;
            } else {
                url += '/sync/top';
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : data.products || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/aliexpress/categories');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSearchQuery('');
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
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-center mb-6 text-gradient">AliExpress Products</h2>
                
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-6">
                    {/* Filters Toggle Button */}
                    <button
                        className="btn btn-ghost gap-2 md:hidden"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <i className="fas fa-filter"></i>
                        Filters
                        {Object.values(filters).some(val => 
                            typeof val === 'object' 
                                ? Object.values(val).some(v => v !== 0) 
                                : val !== 0 && val !== false
                        ) && (
                            <div className="badge badge-primary badge-sm"></div>
                        )}
                    </button>

                    {/* Filters Panel */}
                    <div className={`w-full md:w-64 bg-base-100 p-4 rounded-box shadow-lg mb-4 md:mb-0 
                        ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <h3 className="font-bold mb-4">Filters</h3>
                        
                        {/* Price Range Filter */}
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">Price Range</span>
                                <span className="label-text-alt">
                                    ${filters.priceRange.min} - ${filters.priceRange.max}
                                </span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="input input-bordered w-full"
                                    value={filters.priceRange.min}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                                    })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="input input-bordered w-full"
                                    value={filters.priceRange.max}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                                    })}
                                />
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">Minimum Rating</span>
                                <span className="label-text-alt">{filters.rating}+ ★</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="5"
                                value={filters.rating}
                                className="range range-primary range-sm"
                                step="0.5"
                                onChange={(e) => setFilters({
                                    ...filters,
                                    rating: Number(e.target.value)
                                })}
                            />
                            <div className="w-full flex justify-between text-xs px-2">
                                <span>|</span>
                                <span>|</span>
                                <span>|</span>
                                <span>|</span>
                                <span>|</span>
                                <span>|</span>
                            </div>
                        </div>

                        {/* Shipping Time Filter */}
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">Max Shipping Days</span>
                                <span className="label-text-alt">{filters.maxShippingDays} days</span>
                            </label>
                            <input
                                type="range"
                                min="7"
                                max="60"
                                value={filters.maxShippingDays}
                                className="range range-primary range-sm"
                                step="1"
                                onChange={(e) => setFilters({
                                    ...filters,
                                    maxShippingDays: Number(e.target.value)
                                })}
                            />
                        </div>

                        {/* Stock Filter */}
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">In Stock Only</span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={filters.inStock}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        inStock: e.target.checked
                                    })}
                                />
                            </label>
                        </div>

                        <div className="divider"></div>

                        <button
                            className="btn btn-outline btn-sm w-full"
                            onClick={() => setFilters({
                                priceRange: { min: 0, max: 1000 },
                                rating: 0,
                                maxShippingDays: 30,
                                inStock: true
                            })}
                        >
                            Reset Filters
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                        <div className="join w-full">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="input input-bordered join-item flex-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary join-item">
                                <i className="fas fa-search mr-2" />
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Category Select */}
                    <select
                        className="select select-bordered w-full max-w-xs"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        {Object.entries(categories).map(([name, id]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>

                {/* Sync Button */}
                <div className="text-center mb-6">
                    <button
                        onClick={fetchProducts}
                        className="btn btn-secondary btn-outline"
                    >
                        <i className="fas fa-sync-alt mr-2" />
                        Sync Products
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                    .filter(product => {
                        const price = product.price;
                        const rating = product.rating || 0;
                        const shippingDays = parseInt(product.shippingTime) || 30;
                        
                        return (
                            price >= filters.priceRange.min &&
                            price <= filters.priceRange.max &&
                            rating >= filters.rating &&
                            shippingDays <= filters.maxShippingDays &&
                            (!filters.inStock || product.stock > 0)
                        );
                    })
                    .map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                }
            </div>
            
            {products.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No products available. Try a different search or category.
                </div>
            )}
        </div>
    );
};

export default ProductList;

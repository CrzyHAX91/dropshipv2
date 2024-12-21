import React, { useState } from 'react';

const ProductCard = ({ product }) => {
    const [showModal, setShowModal] = useState(false);
    const profitMargin = (product.price - product.originalPrice - product.shippingCost).toFixed(2);
    const profitPercentage = ((profitMargin / (product.originalPrice + product.shippingCost)) * 100).toFixed(1);

    return (
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <figure className="relative h-48 bg-gray-200">
                <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Product+Image';
                    }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    <span className="badge badge-success">{product.stock} in stock</span>
                </div>
            </figure>
            <div className="card-body">
                <h2 className="card-title text-gradient">{product.name}</h2>
                <p className="text-gray-600">{product.description}</p>
                
                <div className="divider my-2"></div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Processing Time:</span>
                        <p className="font-semibold">{product.processingTime}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Shipping Time:</span>
                        <p className="font-semibold">{product.shippingTime}</p>
                    </div>
                </div>

                <div className="divider my-2"></div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Your Cost</span>
                            <span className="text-base font-semibold">${(product.originalPrice + product.shippingCost).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-sm text-gray-500">Selling Price</span>
                            <span className="text-xl font-bold text-primary">${product.price}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-success/10 p-2 rounded-lg">
                        <span className="text-sm font-medium">Profit Margin:</span>
                        <span className="text-success font-bold">${profitMargin} ({profitPercentage}%)</span>
                    </div>
                </div>

                <div className="card-actions justify-end mt-4 gap-2">
                    <button 
                        className="btn btn-secondary btn-outline rounded-full flex-1"
                        onClick={() => setShowModal(true)}
                    >
                        <i className="fas fa-eye mr-2"></i>
                        Quick View
                    </button>
                    <button className="btn btn-primary btn-gradient rounded-full flex-1">
                        <i className="fas fa-shopping-cart mr-2"></i>
                        Add to Store
                    </button>
                </div>
            </div>

            {/* Quick View Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-5xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-gradient">{product.name}</h3>
                            <button 
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Images */}
                            <div className="space-y-4">
                                <div className="bg-gray-100 rounded-lg p-2">
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-80 object-contain rounded-lg"
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {[product.image].map((img, index) => (
                                        <img 
                                            key={index}
                                            src={img} 
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:ring-2 ring-primary"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-semibold mb-2">Product Details</h4>
                                    <p className="text-gray-600">{product.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="stat bg-base-200 rounded-box">
                                        <div className="stat-title">Processing Time</div>
                                        <div className="stat-value text-lg">{product.processingTime}</div>
                                    </div>
                                    <div className="stat bg-base-200 rounded-box">
                                        <div className="stat-title">Shipping Time</div>
                                        <div className="stat-value text-lg">{product.shippingTime}</div>
                                    </div>
                                </div>

                                <div className="bg-base-200 p-4 rounded-box">
                                    <h4 className="font-semibold mb-2">Pricing Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-500">Your Cost</span>
                                            <p className="text-xl font-bold">${(product.originalPrice + product.shippingCost).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Selling Price</span>
                                            <p className="text-xl font-bold text-primary">${product.price}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 p-2 bg-success/10 rounded-lg">
                                        <div className="flex justify-between">
                                            <span>Profit Margin:</span>
                                            <span className="text-success font-bold">
                                                ${(product.price - product.originalPrice - product.shippingCost).toFixed(2)} 
                                                ({((product.price - product.originalPrice - product.shippingCost) / (product.originalPrice + product.shippingCost) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button className="btn btn-primary btn-gradient w-full">
                                        <i className="fas fa-shopping-cart mr-2"></i>
                                        Add to Store
                                    </button>
                                    <button className="btn btn-outline w-full">
                                        <i className="fas fa-heart mr-2"></i>
                                        Add to Wishlist
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;

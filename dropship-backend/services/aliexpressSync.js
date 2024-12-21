const axios = require('axios');
const logger = require('../logger');
const NodeCache = require('node-cache');

class AliExpressSync {
    constructor() {
        this.API_KEY = '50000601c30atpedfgu3LVvik87Ixlsvle3mSoB7701ceb156fPunYZ43GBg';
        this.BASE_URL = 'https://api.aliexpress.com/v2/';
        this.categories = {
            'ELECTRONICS': '509',
            'FASHION': '100',
            'HOME': '405',
            'BEAUTY': '66',
            'SPORTS': '18',
        };
        
        // Initialize cache with 1 hour TTL
        this.cache = new NodeCache({ 
            stdTTL: 3600,
            checkperiod: 120,
            useClones: false
        });

        // Configure axios retry logic
        this.axiosInstance = axios.create({
            timeout: 10000 // 10 second timeout
        });

        // Add retry interceptor
        this.axiosInstance.interceptors.response.use(null, async error => {
            const { config } = error;
            if (!config || !config.retry) {
                return Promise.reject(error);
            }
            config.retry -= 1;
            config.retryDelay = config.retryDelay || 1000;
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
            
            // Exponential back-off
            config.retryDelay *= 2;
            
            return this.axiosInstance(config);
        });
    }

    async makeRequest(endpoint, params, options = {}) {
        const config = {
            retry: 3, // Number of retries
            retryDelay: 1000, // Start with 1s delay
            ...options
        };

        try {
            const response = await this.axiosInstance.get(
                `${this.BASE_URL}${endpoint}`,
                {
                    params: {
                        ...params,
                        ...this.getAuthParams()
                    },
                    headers: this.getHeaders(),
                    ...config
                }
            );
            return response.data;
        } catch (error) {
            const errorMessage = this.handleApiError(error);
            logger.error(`API request failed: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    handleApiError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const { status, data } = error.response;
            logger.error(`API Error ${status}:`, data);
            return `API Error ${status}: ${data.message || 'Unknown error'}`;
        } else if (error.request) {
            // The request was made but no response was received
            logger.error('No response received:', error.request);
            return 'No response received from the server';
        } else {
            // Something happened in setting up the request
            logger.error('Request setup error:', error.message);
            return error.message;
        }
    }

    async searchProducts(query, options = {}) {
        const cacheKey = `search:${query}:${JSON.stringify(options)}`;
        const cachedResult = this.cache.get(cacheKey);
        
        if (cachedResult) {
            logger.info(`Cache hit for search: ${query}`);
            return cachedResult;
        }

        const params = {
            keywords: query,
            page_size: options.pageSize || 20,
            page_no: options.page || 1,
            sort: options.sort || 'SALE_PRICE_ASC',
            target_currency: options.currency || 'USD',
            target_language: options.language || 'EN',
            ship_to_country: options.shipTo || 'US'
        };

        const data = await this.makeRequest('dsp/aliexpress/affilate/product/query', params);
        const products = this.transformProducts(data.products);
        
        // Cache the results
        this.cache.set(cacheKey, products);
        
        return products;
    }

    async getProductDetails(productId) {
        const cacheKey = `product:${productId}`;
        const cachedResult = this.cache.get(cacheKey);
        
        if (cachedResult) {
            logger.info(`Cache hit for product: ${productId}`);
            return cachedResult;
        }

        const params = { product_ids: productId };
        const data = await this.makeRequest('product/get', params);
        const productDetails = this.transformProductDetails(data.product);
        
        // Cache the results
        this.cache.set(cacheKey, productDetails);
        
        return productDetails;
    }

    async syncCategory(categoryId, options = {}) {
        const cacheKey = `category:${categoryId}:${JSON.stringify(options)}`;
        
        try {
            logger.info(`Starting sync for category ${categoryId}`);
            
            const params = {
                category_ids: categoryId,
                page_size: options.pageSize || 50
            };

            const data = await this.makeRequest('category/products/get', params);
            const products = this.transformProducts(data.products);
            
            // Update cache
            this.cache.set(cacheKey, products);
            
            return products;
        } catch (error) {
            // If error occurs, try to serve stale data
            const staleData = this.cache.get(cacheKey);
            if (staleData) {
                logger.warn(`Serving stale data for category ${categoryId} due to sync error`);
                return staleData;
            }
            throw error;
        }
    }

    async syncTopProducts(options = {}) {
        const cacheKey = `top-products:${JSON.stringify(options)}`;
        
        try {
            const params = {
                sort: 'SALE_PRICE_ASC',
                page_size: options.pageSize || 50
            };

            const data = await this.makeRequest('products/top', params);
            const products = this.transformProducts(data.products);
            
            // Update cache
            this.cache.set(cacheKey, products);
            
            return products;
        } catch (error) {
            // If error occurs, try to serve stale data
            const staleData = this.cache.get(cacheKey);
            if (staleData) {
                logger.warn('Serving stale data for top products due to sync error');
                return staleData;
            }
            throw error;
        }
    }

    transformProducts(products) {
        return products.map(product => ({
            id: product.product_id,
            name: product.product_title,
            description: product.product_description,
            originalPrice: product.price.amount,
            shippingCost: product.shipping_cost || 0,
            stock: product.available_quantity,
            processingTime: `${product.processing_time || '1-3'} business days`,
            shippingTime: `${product.delivery_time || '12-20'} days`,
            images: product.product_images,
            rating: product.evaluation_rate,
            orders: product.order_count,
            supplier: {
                name: product.seller_name,
                rating: product.seller_rating,
                responseRate: product.seller_response_rate
            }
        }));
    }

    transformProductDetails(product) {
        return {
            ...this.transformProducts([product])[0],
            specifications: product.product_specs,
            variations: product.sku_list,
            shippingMethods: product.shipping_methods,
            reviews: product.reviews
        };
    }

    getAuthParams() {
        return {
            app_key: this.API_KEY,
            timestamp: new Date().toISOString(),
            sign_method: 'sha256'
        };
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Start automatic sync process
    startAutoSync(interval = 3600000) { // Default: sync every hour
        setInterval(async () => {
            try {
                logger.info('Starting automatic product sync');
                for (const [category, id] of Object.entries(this.categories)) {
                    logger.info(`Syncing ${category} products`);
                    await this.syncCategory(id);
                }
                logger.info('Automatic sync completed');
            } catch (error) {
                logger.error('Error during automatic sync:', error);
            }
        }, interval);
    }

    clearCache() {
        this.cache.flushAll();
        logger.info('Cache cleared');
    }

    getCacheStats() {
        return {
            keys: this.cache.keys(),
            stats: this.cache.getStats()
        };
    }
}

module.exports = new AliExpressSync();

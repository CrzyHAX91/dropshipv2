const axios = require('axios');
const logger = require('../logger');

class ShippingService {
    constructor() {
        // Shipping provider configurations
        this.providers = {
            fedex: {
                enabled: true,
                apiKey: process.env.FEDEX_API_KEY,
                accountNumber: process.env.FEDEX_ACCOUNT_NUMBER,
                baseUrl: 'https://apis.fedex.com'
            },
            ups: {
                enabled: true,
                apiKey: process.env.UPS_API_KEY,
                accountNumber: process.env.UPS_ACCOUNT_NUMBER,
                baseUrl: 'https://onlinetools.ups.com/api'
            },
            dhl: {
                enabled: true,
                apiKey: process.env.DHL_API_KEY,
                accountNumber: process.env.DHL_ACCOUNT_NUMBER,
                baseUrl: 'https://api.dhl.com'
            }
        };

        // Initialize API clients
        this.clients = {};
        Object.keys(this.providers).forEach(provider => {
            if (this.providers[provider].enabled) {
                this.clients[provider] = axios.create({
                    baseURL: this.providers[provider].baseUrl,
                    headers: {
                        'Authorization': `Bearer ${this.providers[provider].apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        });
    }

    // Get shipping rates from all enabled providers
    async getShippingRates(packageDetails) {
        const rates = {};
        const errors = {};

        await Promise.all(
            Object.keys(this.providers)
                .filter(provider => this.providers[provider].enabled)
                .map(async provider => {
                    try {
                        const rate = await this[`get${provider.charAt(0).toUpperCase() + provider.slice(1)}Rates`](packageDetails);
                        rates[provider] = rate;
                    } catch (error) {
                        logger.error(`Error getting ${provider} rates:`, error);
                        errors[provider] = error.message;
                    }
                })
        );

        return {
            success: Object.keys(rates).length > 0,
            rates,
            errors
        };
    }

    // Create shipping label
    async createShippingLabel(shipmentDetails, provider) {
        try {
            if (!this.providers[provider]?.enabled) {
                throw new Error(`Shipping provider ${provider} is not enabled`);
            }

            const label = await this[`create${provider.charAt(0).toUpperCase() + provider.slice(1)}Label`](shipmentDetails);
            
            await this.saveShippingDetails({
                orderId: shipmentDetails.orderId,
                provider,
                trackingNumber: label.trackingNumber,
                labelUrl: label.labelUrl,
                status: 'created'
            });

            return label;
        } catch (error) {
            logger.error(`Error creating shipping label (${provider}):`, error);
            throw error;
        }
    }

    // Track shipment
    async trackShipment(trackingNumber, provider) {
        try {
            if (!this.providers[provider]?.enabled) {
                throw new Error(`Shipping provider ${provider} is not enabled`);
            }

            const tracking = await this[`track${provider.charAt(0).toUpperCase() + provider.slice(1)}Shipment`](trackingNumber);
            
            await this.updateShipmentStatus(trackingNumber, tracking.status);

            return tracking;
        } catch (error) {
            logger.error(`Error tracking shipment (${provider}):`, error);
            throw error;
        }
    }

    // FedEx specific implementations
    async getFedexRates(packageDetails) {
        try {
            const response = await this.clients.fedex.post('/rate/v1/rates', {
                accountNumber: this.providers.fedex.accountNumber,
                requestedShipment: {
                    shipper: packageDetails.from,
                    recipient: packageDetails.to,
                    requestedPackageLineItems: [{
                        weight: packageDetails.weight,
                        dimensions: packageDetails.dimensions
                    }],
                    serviceType: packageDetails.serviceType || 'STANDARD_OVERNIGHT'
                }
            });

            return response.data.output.rateReplyDetails;
        } catch (error) {
            logger.error('FedEx rate error:', error);
            throw error;
        }
    }

    async createFedexLabel(shipmentDetails) {
        try {
            const response = await this.clients.fedex.post('/ship/v1/shipments', {
                accountNumber: this.providers.fedex.accountNumber,
                requestedShipment: {
                    shipper: shipmentDetails.from,
                    recipient: shipmentDetails.to,
                    requestedPackageLineItems: [{
                        weight: shipmentDetails.weight,
                        dimensions: shipmentDetails.dimensions
                    }],
                    serviceType: shipmentDetails.serviceType,
                    labelSpecification: {
                        imageType: 'PDF',
                        labelStockType: 'PAPER_4X6'
                    }
                }
            });

            return {
                trackingNumber: response.data.output.transactionShipments[0].trackingNumber,
                labelUrl: response.data.output.transactionShipments[0].labelUrl
            };
        } catch (error) {
            logger.error('FedEx label creation error:', error);
            throw error;
        }
    }

    async trackFedexShipment(trackingNumber) {
        try {
            const response = await this.clients.fedex.post('/track/v1/trackingnumbers', {
                trackingInfo: [{
                    trackingNumberInfo: {
                        trackingNumber
                    }
                }]
            });

            return {
                status: response.data.output.completeTrackResults[0].trackResults[0].latestStatusDetail.status,
                location: response.data.output.completeTrackResults[0].trackResults[0].latestStatusDetail.location,
                timestamp: response.data.output.completeTrackResults[0].trackResults[0].latestStatusDetail.statusTimestamp
            };
        } catch (error) {
            logger.error('FedEx tracking error:', error);
            throw error;
        }
    }

    // UPS specific implementations
    async getUpsRates(packageDetails) {
        try {
            const response = await this.clients.ups.post('/rating/v1/Rate', {
                RateRequest: {
                    Shipment: {
                        Shipper: packageDetails.from,
                        ShipTo: packageDetails.to,
                        Package: {
                            PackagingType: { Code: '02' },
                            Dimensions: packageDetails.dimensions,
                            PackageWeight: packageDetails.weight
                        }
                    }
                }
            });

            return response.data.RateResponse.RatedShipment;
        } catch (error) {
            logger.error('UPS rate error:', error);
            throw error;
        }
    }

    async createUpsLabel(shipmentDetails) {
        try {
            const response = await this.clients.ups.post('/shipping/v1/shipments', {
                ShipmentRequest: {
                    Shipment: {
                        Shipper: shipmentDetails.from,
                        ShipTo: shipmentDetails.to,
                        Package: {
                            PackagingType: { Code: '02' },
                            Dimensions: shipmentDetails.dimensions,
                            PackageWeight: shipmentDetails.weight
                        },
                        Service: { Code: shipmentDetails.serviceType },
                        LabelSpecification: {
                            LabelImageFormat: { Code: 'PDF' },
                            LabelStockSize: { Height: '6', Width: '4' }
                        }
                    }
                }
            });

            return {
                trackingNumber: response.data.ShipmentResponse.ShipmentResults.TrackingNumber,
                labelUrl: response.data.ShipmentResponse.ShipmentResults.LabelURL
            };
        } catch (error) {
            logger.error('UPS label creation error:', error);
            throw error;
        }
    }

    async trackUpsShipment(trackingNumber) {
        try {
            const response = await this.clients.ups.post('/track/v1/details', {
                TrackRequest: {
                    InquiryNumber: trackingNumber
                }
            });

            return {
                status: response.data.TrackResponse.Shipment[0].CurrentStatus.Status,
                location: response.data.TrackResponse.Shipment[0].CurrentStatus.Location,
                timestamp: response.data.TrackResponse.Shipment[0].CurrentStatus.Timestamp
            };
        } catch (error) {
            logger.error('UPS tracking error:', error);
            throw error;
        }
    }

    // DHL specific implementations
    async getDhlRates(packageDetails) {
        try {
            const response = await this.clients.dhl.post('/rates/v1/rates', {
                customerDetails: {
                    accountNumber: this.providers.dhl.accountNumber
                },
                plannedShipmentDetails: {
                    pickup: packageDetails.from,
                    delivery: packageDetails.to,
                    packages: [{
                        weight: packageDetails.weight,
                        dimensions: packageDetails.dimensions
                    }]
                }
            });

            return response.data.products;
        } catch (error) {
            logger.error('DHL rate error:', error);
            throw error;
        }
    }

    async createDhlLabel(shipmentDetails) {
        try {
            const response = await this.clients.dhl.post('/shipments/v1/shipments', {
                customerDetails: {
                    accountNumber: this.providers.dhl.accountNumber
                },
                shipmentDetails: {
                    pickup: shipmentDetails.from,
                    delivery: shipmentDetails.to,
                    packages: [{
                        weight: shipmentDetails.weight,
                        dimensions: shipmentDetails.dimensions
                    }],
                    service: shipmentDetails.serviceType,
                    outputFormat: {
                        type: 'PDF',
                        size: '4X6'
                    }
                }
            });

            return {
                trackingNumber: response.data.shipmentTrackingNumber,
                labelUrl: response.data.documents.label
            };
        } catch (error) {
            logger.error('DHL label creation error:', error);
            throw error;
        }
    }

    async trackDhlShipment(trackingNumber) {
        try {
            const response = await this.clients.dhl.get(`/tracking/v1/shipments/${trackingNumber}`);

            return {
                status: response.data.shipments[0].status,
                location: response.data.shipments[0].location,
                timestamp: response.data.shipments[0].timestamp
            };
        } catch (error) {
            logger.error('DHL tracking error:', error);
            throw error;
        }
    }

    // Utility methods
    async saveShippingDetails(details) {
        // Implementation for saving shipping details to database
    }

    async updateShipmentStatus(trackingNumber, status) {
        // Implementation for updating shipment status in database
    }

    validateAddress(address) {
        // Implementation for address validation
        return {
            isValid: true,
            normalizedAddress: address
        };
    }

    calculateDimensions(items) {
        // Implementation for calculating package dimensions based on items
        return {
            length: 0,
            width: 0,
            height: 0,
            weight: 0
        };
    }
}

module.exports = new ShippingService();

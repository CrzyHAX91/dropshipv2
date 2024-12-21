const axios = require('axios');
const logger = require('../logger');

class AIService {
    constructor() {
        this.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        this.OPENROUTER_URL = 'https://openrouter.ai/api/v1';
        
        this.models = {
            DEFAULT: 'openai/gpt-4',
            FAST: 'anthropic/claude-instant-v1',
            ADVANCED: 'anthropic/claude-2'
        };

        this.tasks = {
            PRICING: 'pricing_optimization',
            INVENTORY: 'inventory_management',
            MARKETING: 'marketing_automation',
            CONTENT: 'content_generation',
            CUSTOMER: 'customer_analysis'
        };
    }

    async getAIResponse(prompt, options = {}) {
        try {
            const response = await axios.post(`${this.OPENROUTER_URL}/chat/completions`, {
                model: options.model || this.models.DEFAULT,
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            logger.error('AI response error:', error);
            throw error;
        }
    }

    // Pricing Optimization
    async optimizePricing(productData, marketData) {
        try {
            const prompt = `
                As an AI pricing expert, analyze the following product and market data to suggest optimal pricing:
                Product: ${JSON.stringify(productData)}
                Market Data: ${JSON.stringify(marketData)}
                Consider: competitor prices, market trends, demand elasticity, and profit margins.
                Provide: recommended price, reasoning, and confidence score.
            `;

            const response = await this.getAIResponse(prompt, {
                model: this.models.ADVANCED,
                temperature: 0.3
            });

            return this.parseAIResponse(response);
        } catch (error) {
            logger.error('AI pricing optimization error:', error);
            throw error;
        }
    }

    // Inventory Prediction
    async predictInventoryNeeds(productHistory, marketTrends) {
        try {
            const prompt = `
                As an AI inventory manager, analyze this data to predict future inventory needs:
                Product History: ${JSON.stringify(productHistory)}
                Market Trends: ${JSON.stringify(marketTrends)}
                Consider: seasonal patterns, growth trends, and market events.
                Provide: recommended stock levels, reorder points, and confidence intervals.
            `;

            const response = await this.getAIResponse(prompt, {
                model: this.models.ADVANCED,
                temperature: 0.2
            });

            return this.parseAIResponse(response);
        } catch (error) {
            logger.error('AI inventory prediction error:', error);
            throw error;
        }
    }

    // Marketing Content Generation
    async generateMarketingContent(product, targetAudience, platform) {
        try {
            const prompt = `
                As an AI marketing expert, create engaging content for:
                Product: ${JSON.stringify(product)}
                Target Audience: ${JSON.stringify(targetAudience)}
                Platform: ${platform}
                Consider: platform best practices, audience preferences, and product features.
                Provide: content text, hashtags, and posting recommendations.
            `;

            const response = await this.getAIResponse(prompt, {
                model: this.models.DEFAULT,
                temperature: 0.8
            });

            return this.parseAIResponse(response);
        } catch (error) {
            logger.error('AI content generation error:', error);
            throw error;
        }
    }

    // Customer Segmentation
    async analyzeCustomerSegments(customerData, behaviors) {
        try {
            const prompt = `
                As an AI customer analyst, identify valuable customer segments from:
                Customer Data: ${JSON.stringify(customerData)}
                Behaviors: ${JSON.stringify(behaviors)}
                Consider: purchase patterns, lifetime value, and engagement metrics.
                Provide: segment definitions, characteristics, and targeting recommendations.
            `;

            const response = await this.getAIResponse(prompt, {
                model: this.models.ADVANCED,
                temperature: 0.4
            });

            return this.parseAIResponse(response);
        } catch (error) {
            logger.error('AI customer analysis error:', error);
            throw error;
        }
    }

    // Email Campaign Optimization
    async optimizeEmailCampaign(campaignData, performanceHistory) {
        try {
            const prompt = `
                As an AI email marketing expert, optimize this campaign:
                Campaign Data: ${JSON.stringify(campaignData)}
                Performance History: ${JSON.stringify(performanceHistory)}
                Consider: open rates, click rates, conversion rates, and timing.
                Provide: subject line suggestions, content improvements, and sending time recommendations.
            `;

            const response = await this.getAIResponse(prompt, {
                model: this.models.DEFAULT,
                temperature: 0.6
            });

            return this.parseAIResponse(response);
        } catch (error) {
            logger.error('AI email optimization error:', error);
            throw error;
        }
    }

    // Market Trend Analysis
    async analyzeMarketTrends(marketData, timeframe) {
        try {
            const prompt = `
                As an AI market analyst, analyze these trends:
                Market Data: ${JSON.stringify(marketData)}
                Timeframe: ${timeframe}
                Consider: price movements, demand shifts, and competitive changes.
                Provide: trend analysis, predictions, and recommended actions.
            `;

            const response = await this.getAIResponse(prompt, {
                model: this.models.ADVANCED,
                temperature: 0.3
            });

            return this.parseAIResponse(response);
        } catch (error) {
            logger.error('AI trend analysis error:', error);
            throw error;
        }
    }

    // Automation Rule Suggestions
    async suggestAutomationRules(businessData, currentRules) {
        try {
            const prompt = `
                As an AI automation expert, suggest new automation rules based on:
                Business Data: ${JSON.stringify(businessData)}
                Current Rules: ${JSON.stringify(currentRules)}
                Consider: business goals, operational efficiency, and performance metrics.
                Provide: rule suggestions, implementation steps, and expected outcomes.
            `;

            const response = await this.getAIResponse(prompt, {
                model: this.models.ADVANCED,
                temperature: 0.5
            });

            return this.parseAIResponse(response);
        } catch (error) {
            logger.error('AI rule suggestion error:', error);
            throw error;
        }
    }

    // Performance Optimization
    async optimizePerformance(performanceData, goals) {
        try {
            const prompt = `
                As an AI performance optimizer, analyze and suggest improvements:
                Performance Data: ${JSON.stringify(performanceData)}
                Goals: ${JSON.stringify(goals)}
                Consider: current metrics, bottlenecks, and optimization opportunities.
                Provide: optimization recommendations, implementation priority, and expected impact.
            `;

            const response = await this.getAIResponse(prompt, {
                model: this.models.ADVANCED,
                temperature: 0.4
            });

            return this.parseAIResponse(response);
        } catch (error) {
            logger.error('AI performance optimization error:', error);
            throw error;
        }
    }

    // Helper Methods
    parseAIResponse(response) {
        try {
            // Attempt to parse JSON response
            if (response.startsWith('{') || response.startsWith('[')) {
                return JSON.parse(response);
            }

            // Parse structured text response
            const sections = response.split('\n\n');
            const parsed = {};

            sections.forEach(section => {
                const [key, ...values] = section.split('\n');
                parsed[key.toLowerCase().replace(':', '')] = values.join('\n').trim();
            });

            return parsed;
        } catch (error) {
            logger.error('AI response parsing error:', error);
            return { rawResponse: response };
        }
    }

    validateResponse(response, expectedFields) {
        const missing = expectedFields.filter(field => !response[field]);
        if (missing.length > 0) {
            throw new Error(`Invalid AI response: missing fields ${missing.join(', ')}`);
        }
        return true;
    }
}

module.exports = new AIService();

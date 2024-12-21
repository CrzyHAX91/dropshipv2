const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const { FacebookApi } = require('facebook-nodejs-business-sdk');
const { google } = require('googleapis');
const logger = require('../logger');

class SocialMediaService {
    constructor() {
        // Initialize social media platforms
        this.platforms = {
            facebook: {
                enabled: true,
                api: new FacebookApi({
                    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
                    appId: process.env.FACEBOOK_APP_ID,
                    appSecret: process.env.FACEBOOK_APP_SECRET
                })
            },
            twitter: {
                enabled: true,
                api: new TwitterApi({
                    appKey: process.env.TWITTER_API_KEY,
                    appSecret: process.env.TWITTER_API_SECRET,
                    accessToken: process.env.TWITTER_ACCESS_TOKEN,
                    accessSecret: process.env.TWITTER_ACCESS_SECRET
                })
            },
            instagram: {
                enabled: true,
                api: new FacebookApi({
                    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
                    appId: process.env.INSTAGRAM_APP_ID,
                    appSecret: process.env.INSTAGRAM_APP_SECRET
                })
            },
            pinterest: {
                enabled: true,
                accessToken: process.env.PINTEREST_ACCESS_TOKEN,
                baseUrl: 'https://api.pinterest.com/v5'
            }
        };

        // Initialize Google Analytics
        this.analytics = google.analytics('v3');
        this.analyticsAuth = new google.auth.JWT(
            process.env.GOOGLE_CLIENT_EMAIL,
            null,
            process.env.GOOGLE_PRIVATE_KEY,
            ['https://www.googleapis.com/auth/analytics.readonly']
        );
    }

    // Post content to multiple platforms
    async postContent(content, platforms = ['facebook', 'twitter', 'instagram']) {
        const results = {};
        const errors = {};

        await Promise.all(
            platforms
                .filter(platform => this.platforms[platform]?.enabled)
                .map(async platform => {
                    try {
                        const result = await this[`post${platform.charAt(0).toUpperCase() + platform.slice(1)}`](content);
                        results[platform] = result;
                    } catch (error) {
                        logger.error(`Error posting to ${platform}:`, error);
                        errors[platform] = error.message;
                    }
                })
        );

        return {
            success: Object.keys(results).length > 0,
            results,
            errors
        };
    }

    // Facebook posting
    async postFacebook(content) {
        try {
            const result = await this.platforms.facebook.api.post('/me/feed', {
                message: content.text,
                link: content.url,
                picture: content.image
            });

            await this.saveSocialPost({
                platform: 'facebook',
                postId: result.id,
                content,
                status: 'published'
            });

            return {
                id: result.id,
                url: `https://facebook.com/${result.id}`
            };
        } catch (error) {
            logger.error('Facebook posting error:', error);
            throw error;
        }
    }

    // Twitter posting
    async postTwitter(content) {
        try {
            let mediaIds = [];
            if (content.image) {
                const mediaUpload = await this.platforms.twitter.api.v1.uploadMedia(content.image);
                mediaIds.push(mediaUpload.media_id_string);
            }

            const tweet = await this.platforms.twitter.api.v2.tweet({
                text: content.text,
                media: { media_ids: mediaIds }
            });

            await this.saveSocialPost({
                platform: 'twitter',
                postId: tweet.data.id,
                content,
                status: 'published'
            });

            return {
                id: tweet.data.id,
                url: `https://twitter.com/i/web/status/${tweet.data.id}`
            };
        } catch (error) {
            logger.error('Twitter posting error:', error);
            throw error;
        }
    }

    // Instagram posting
    async postInstagram(content) {
        try {
            // First create a media container
            const mediaContainer = await this.platforms.instagram.api.post(
                `/${process.env.INSTAGRAM_BUSINESS_ID}/media`,
                {
                    image_url: content.image,
                    caption: content.text
                }
            );

            // Then publish the container
            const result = await this.platforms.instagram.api.post(
                `/${process.env.INSTAGRAM_BUSINESS_ID}/media_publish`,
                {
                    creation_id: mediaContainer.id
                }
            );

            await this.saveSocialPost({
                platform: 'instagram',
                postId: result.id,
                content,
                status: 'published'
            });

            return {
                id: result.id,
                url: `https://instagram.com/p/${result.shortcode}`
            };
        } catch (error) {
            logger.error('Instagram posting error:', error);
            throw error;
        }
    }

    // Pinterest posting
    async postPinterest(content) {
        try {
            // Create a pin
            const response = await axios.post(
                `${this.platforms.pinterest.baseUrl}/pins`,
                {
                    title: content.title,
                    description: content.text,
                    media_source: {
                        source_type: 'image_url',
                        url: content.image
                    },
                    board_id: process.env.PINTEREST_BOARD_ID
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.platforms.pinterest.accessToken}`
                    }
                }
            );

            await this.saveSocialPost({
                platform: 'pinterest',
                postId: response.data.id,
                content,
                status: 'published'
            });

            return {
                id: response.data.id,
                url: response.data.url
            };
        } catch (error) {
            logger.error('Pinterest posting error:', error);
            throw error;
        }
    }

    // Schedule social media posts
    async schedulePost(content, platforms, scheduledTime) {
        try {
            const schedule = await this.saveScheduledPost({
                content,
                platforms,
                scheduledTime,
                status: 'scheduled'
            });

            return {
                scheduleId: schedule.id,
                scheduledTime,
                platforms
            };
        } catch (error) {
            logger.error('Post scheduling error:', error);
            throw error;
        }
    }

    // Get social media analytics
    async getAnalytics(platform, metrics, dateRange) {
        try {
            switch (platform) {
                case 'facebook':
                    return await this.getFacebookAnalytics(metrics, dateRange);
                case 'twitter':
                    return await this.getTwitterAnalytics(metrics, dateRange);
                case 'instagram':
                    return await this.getInstagramAnalytics(metrics, dateRange);
                case 'pinterest':
                    return await this.getPinterestAnalytics(metrics, dateRange);
                default:
                    throw new Error('Unsupported platform');
            }
        } catch (error) {
            logger.error(`${platform} analytics error:`, error);
            throw error;
        }
    }

    // Get Facebook analytics
    async getFacebookAnalytics(metrics, dateRange) {
        try {
            const result = await this.platforms.facebook.api.get('/me/insights', {
                metric: metrics.join(','),
                period: 'day',
                since: dateRange.start,
                until: dateRange.end
            });

            return this.formatAnalyticsData('facebook', result.data);
        } catch (error) {
            logger.error('Facebook analytics error:', error);
            throw error;
        }
    }

    // Get Twitter analytics
    async getTwitterAnalytics(metrics, dateRange) {
        try {
            const result = await this.platforms.twitter.api.v2.get('tweets/metrics', {
                ids: await this.getRecentTweetIds(),
                'tweet.fields': metrics.join(',')
            });

            return this.formatAnalyticsData('twitter', result.data);
        } catch (error) {
            logger.error('Twitter analytics error:', error);
            throw error;
        }
    }

    // Monitor social media mentions
    async monitorMentions(platforms = ['twitter', 'facebook', 'instagram']) {
        const mentions = {};
        const errors = {};

        await Promise.all(
            platforms
                .filter(platform => this.platforms[platform]?.enabled)
                .map(async platform => {
                    try {
                        mentions[platform] = await this[`get${platform.charAt(0).toUpperCase() + platform.slice(1)}Mentions`]();
                    } catch (error) {
                        logger.error(`Error getting ${platform} mentions:`, error);
                        errors[platform] = error.message;
                    }
                })
        );

        return {
            success: Object.keys(mentions).length > 0,
            mentions,
            errors
        };
    }

    // Utility methods
    async saveSocialPost(post) {
        // Implementation for saving social media post details to database
    }

    async saveScheduledPost(schedule) {
        // Implementation for saving scheduled post to database
    }

    formatAnalyticsData(platform, data) {
        // Implementation for formatting analytics data
        return {
            platform,
            metrics: data
        };
    }

    async getRecentTweetIds() {
        // Implementation for getting recent tweet IDs
        return [];
    }
}

module.exports = new SocialMediaService();

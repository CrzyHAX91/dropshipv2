class PerformanceMonitor {
    constructor() {
        this.metrics = {
            navigation: {},
            resources: {},
            memory: {},
            errors: [],
            longTasks: []
        };

        this.initializeObservers();
        this.setupErrorTracking();
        this.trackLongTasks();
    }

    initializeObservers() {
        // Performance Observer for navigation timing
        if ('PerformanceObserver' in window) {
            // Navigation Timing
            const navigationObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        this.metrics.navigation = {
                            dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
                            connectionTime: entry.connectEnd - entry.connectStart,
                            ttfb: entry.responseStart - entry.requestStart,
                            domInteractive: entry.domInteractive,
                            domComplete: entry.domComplete,
                            loadComplete: entry.loadEventEnd,
                            totalTime: entry.duration
                        };
                    }
                }
            });
            navigationObserver.observe({ entryTypes: ['navigation'] });

            // Resource Timing
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.resources[entry.name] = {
                        duration: entry.duration,
                        size: entry.transferSize,
                        type: entry.initiatorType
                    };
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });

            // Long Tasks
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.longTasks.push({
                        duration: entry.duration,
                        timestamp: entry.startTime,
                        location: entry.name
                    });
                }
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
    }

    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.metrics.errors.push({
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                timestamp: new Date().toISOString()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errors.push({
                message: event.reason,
                type: 'unhandledrejection',
                timestamp: new Date().toISOString()
            });
        });
    }

    trackLongTasks() {
        if ('requestIdleCallback' in window) {
            const trackCallback = () => {
                this.gatherMemoryMetrics();
                requestIdleCallback(trackCallback);
            };
            requestIdleCallback(trackCallback);
        }
    }

    gatherMemoryMetrics() {
        if ('memory' in performance) {
            this.metrics.memory = {
                usedJSHeap: performance.memory.usedJSHeapSize,
                totalJSHeap: performance.memory.totalJSHeapSize,
                jsHeapLimit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date().toISOString()
        };
    }

    getResourceMetrics() {
        const resources = Object.entries(this.metrics.resources).map(([url, metrics]) => ({
            url,
            ...metrics
        }));

        return {
            totalResources: resources.length,
            totalSize: resources.reduce((acc, curr) => acc + (curr.size || 0), 0),
            slowestResources: resources
                .sort((a, b) => b.duration - a.duration)
                .slice(0, 5)
        };
    }

    getLongTasksReport() {
        if (this.metrics.longTasks.length === 0) return null;

        return {
            count: this.metrics.longTasks.length,
            totalDuration: this.metrics.longTasks.reduce((acc, curr) => acc + curr.duration, 0),
            averageDuration: this.metrics.longTasks.reduce((acc, curr) => acc + curr.duration, 0) / this.metrics.longTasks.length,
            longestTask: Math.max(...this.metrics.longTasks.map(task => task.duration))
        };
    }

    getErrorReport() {
        return {
            totalErrors: this.metrics.errors.length,
            recentErrors: this.metrics.errors.slice(-5),
            errorTypes: this.metrics.errors.reduce((acc, curr) => {
                const type = curr.type || 'runtime';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {})
        };
    }

    logMetrics() {
        console.group('Performance Metrics Report');
        console.log('Navigation Timing:', this.metrics.navigation);
        console.log('Resource Usage:', this.getResourceMetrics());
        console.log('Long Tasks:', this.getLongTasksReport());
        console.log('Error Report:', this.getErrorReport());
        console.log('Memory Usage:', this.metrics.memory);
        console.groupEnd();
    }

    // Send metrics to backend
    async sendMetricsToServer() {
        try {
            const response = await fetch('http://localhost:3000/api/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.getMetrics())
            });

            if (!response.ok) {
                throw new Error('Failed to send metrics');
            }
        } catch (error) {
            console.error('Error sending metrics:', error);
        }
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Set up periodic reporting
setInterval(() => {
    performanceMonitor.logMetrics();
    performanceMonitor.sendMetricsToServer();
}, 60000); // Report every minute

export default performanceMonitor;

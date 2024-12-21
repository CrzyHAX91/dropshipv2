const performanceMonitor = (() => {
  const metrics = {
    pageLoadTime: 0,
    apiResponseTimes: {},
    errorCount: 0,
  };

  const startMonitoring = () => {
    const startTime = performance.now();

    window.addEventListener('load', () => {
      metrics.pageLoadTime = performance.now() - startTime;
      console.log(`Page Load Time: ${metrics.pageLoadTime.toFixed(2)} ms`);
    });
  };

  const trackApiResponseTime = (apiName, responseTime) => {
    metrics.apiResponseTimes[apiName] = responseTime;
    console.log(`API Response Time for ${apiName}: ${responseTime.toFixed(2)} ms`);
  };

  const incrementErrorCount = () => {
    metrics.errorCount += 1;
    console.log(`Error Count: ${metrics.errorCount}`);
  };

  const getMetrics = () => metrics;

  return {
    startMonitoring,
    trackApiResponseTime,
    incrementErrorCount,
    getMetrics,
  };
})();

export default performanceMonitor;

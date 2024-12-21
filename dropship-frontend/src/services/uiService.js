const uiService = (() => {
  const loadingStates = new Set();

  const setLoading = (key, isLoading) => {
    if (isLoading) {
      loadingStates.add(key);
    } else {
      loadingStates.delete(key);
    }
  };

  const isLoading = () => loadingStates.size > 0;

  const showToast = (message, severity = 'info') => {
    // TODO: Implement toast notification logic
    console.log(`Toast: ${message} | Severity: ${severity}`);
  };

  return {
    setLoading,
    isLoading,
    showToast,
  };
})();

export default uiService;

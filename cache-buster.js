// Cache busting utility
const VERSION = Date.now();

// Export version for use in imports
export const CACHE_VERSION = VERSION;

// Force refresh of specific modules
if (typeof window !== 'undefined') {
    window.CACHE_VERSION = VERSION;
    console.log('Cache version:', VERSION);
}
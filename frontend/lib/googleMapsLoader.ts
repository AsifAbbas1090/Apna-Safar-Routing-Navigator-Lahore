/**
 * Google Maps Script Loader
 * Ensures the Google Maps JavaScript API is loaded only once with proper async loading
 */

let loadPromise: Promise<void> | null = null;
let isLoaded = false;

/**
 * Check if Google Maps API is fully loaded and ready
 */
function isGoogleMapsReady(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.google &&
    window.google.maps &&
    window.google.maps.Map &&
    window.google.maps.LatLngBounds
  );
}

/**
 * Wait for Google Maps API to be fully ready
 */
function waitForGoogleMapsReady(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isGoogleMapsReady()) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (isGoogleMapsReady()) {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        resolve();
      }
    }, 50); // Check every 50ms

    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      if (!isGoogleMapsReady()) {
        reject(new Error('Google Maps API failed to load within timeout'));
      }
    }, timeout);
  });
}

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  // If already loaded and ready, return resolved promise
  if (isLoaded && isGoogleMapsReady()) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (loadPromise) {
    return loadPromise.then(() => waitForGoogleMapsReady());
  }

  // Check if script already exists in DOM
  const existingScripts = document.querySelectorAll(
    'script[src*="maps.googleapis.com/maps/api/js"]'
  ) as NodeListOf<HTMLScriptElement>;

  // Remove any scripts without loading=async to prevent warnings
  existingScripts.forEach(script => {
    const src = script.getAttribute('src') || '';
    if (!src.includes('loading=async')) {
      console.warn('Removing Google Maps script without loading=async to prevent warnings');
      script.remove();
    }
  });

  // Check if a valid script still exists
  const validScript = document.querySelector(
    'script[src*="maps.googleapis.com/maps/api/js"][src*="loading=async"]'
  ) as HTMLScriptElement;

  if (validScript) {
    // Script exists with proper async loading, wait for it to be fully ready
    loadPromise = waitForGoogleMapsReady().then(() => {
      isLoaded = true;
    });
    return loadPromise;
  }

  // Create new script with loading=async parameter (Google's best practice)
  // Use callback approach for better control
  const callbackName = `initGoogleMaps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  loadPromise = new Promise((resolve, reject) => {
    // Set up callback
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      // Wait for API to be fully ready
      waitForGoogleMapsReady()
        .then(() => {
          isLoaded = true;
          resolve();
        })
        .catch(reject);
    };

    const script = document.createElement('script');
    // Use callback parameter for proper async loading
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete (window as any)[callbackName];
      loadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
}


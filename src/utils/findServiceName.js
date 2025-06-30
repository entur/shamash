/**
 * Extract service name from the URL pathname
 * @param {string} pathname - The current pathname (e.g., "/vehicles-v2")
 * @param {string} basePath - The base path (e.g., "" for root or "/subpath")
 * @returns {string|null} - The service name or null if not found
 */
const findServiceName = (pathname, basePath = '') => {
  // Handle null/undefined pathname
  if (!pathname || typeof pathname !== 'string') {
    return null;
  }

  // Remove the base path from the pathname if it exists
  let path = pathname;
  if (basePath && typeof basePath === 'string' && pathname.startsWith(basePath)) {
    path = pathname.substring(basePath.length);
  }

  // Remove leading slash
  if (path.startsWith('/')) {
    path = path.substring(1);
  }

  // Return the first path segment as the service name
  // e.g., "vehicles-v2" from "/vehicles-v2" or "vehicles-v2/something"
  const segments = path.split('/');
  return segments[0] || null;
};

export default findServiceName;

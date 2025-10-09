
const routes = {};

/**
 * Register a route with a name
 * @param {string} name - route name
 * @param {string} path - actual URL
 */
export function registerRoute(name, path) {
  routes[name] = path;
}

/**
 * Get route by name
 * @param {string} name
 * @returns {string} path
 */
export function route(name) {
  return routes[name] || "/";
}

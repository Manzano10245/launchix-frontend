(function(){
  // Frontend API configuration
  // You can override these at runtime via localStorage keys of the same name
  const LS = (k, d) => window.localStorage.getItem(k) || d;

  const BASE = LS('API_BASE_URL', 'http://127.0.0.1:8001'); // Backend PHP por defecto
  const PREFIX = LS('API_PREFIX', '/api/v1');
  const WITH_CREDENTIALS = LS('API_WITH_CREDENTIALS', 'false') === 'true'; // for Sanctum cookie auth
  const AUTH_STRATEGY = LS('API_AUTH_STRATEGY', 'token'); // default to Bearer token

  // Expose in window for all modules
  window.API_BASE_URL = BASE.replace(/\/$/, '');
  window.API_PREFIX = PREFIX.startsWith('/') ? PREFIX : '/' + PREFIX;
  window.API_WITH_CREDENTIALS = WITH_CREDENTIALS;
  window.API_AUTH_STRATEGY = AUTH_STRATEGY;

  // Optional separated endpoints for user/entrepreneur auth
  // You can set these in localStorage to override, e.g.:
  // localStorage.setItem('API_LOGIN_USER', '/api/v1/login');
  // localStorage.setItem('API_LOGIN_ENTREPRENEUR', '/api/v1/entrepreneur/login');
  // localStorage.setItem('API_REGISTER_USER', '/api/v1/register');
  // localStorage.setItem('API_REGISTER_ENTREPRENEUR', '/api/v1/entrepreneur/register');
  window.API_LOGIN_USER = LS('API_LOGIN_USER', `${window.API_PREFIX}/login`);
  window.API_LOGIN_ENTREPRENEUR = LS('API_LOGIN_ENTREPRENEUR', `${window.API_PREFIX}/entrepreneur/login`);
  window.API_REGISTER_USER = LS('API_REGISTER_USER', `${window.API_PREFIX}/register`);
  window.API_REGISTER_ENTREPRENEUR = LS('API_REGISTER_ENTREPRENEUR', `${window.API_PREFIX}/entrepreneur/register`);

  // Optional bearer token support
  window.API_TOKEN = LS('API_TOKEN', '');

  // Optional entrepreneur endpoints (relative, prefixed by API_PREFIX)
  // Override via localStorage when backend routes differ
  // Absolute (include prefix) - for modules that build full URLs with API_FULL
  window.API_EP_ME = LS('API_EP_ME', `${window.API_PREFIX}/entrepreneur/me`);
  window.API_EP_AVATAR = LS('API_EP_AVATAR', `${window.API_PREFIX}/entrepreneur/avatar`);
  window.API_EP_PRODUCTS = LS('API_EP_PRODUCTS', `${window.API_PREFIX}/entrepreneur/products`);
  window.API_EP_SERVICES = LS('API_EP_SERVICES', `${window.API_PREFIX}/entrepreneur/services`);

  // Relative (exclude prefix) - for modules whose base already includes API_PREFIX
  // Default to generic resource endpoints to avoid initial 404s; you can override in localStorage to use /entrepreneur/*
  window.API_REL_EP_PRODUCTS = LS('API_REL_EP_PRODUCTS', '/products');
  window.API_REL_EP_SERVICES = LS('API_REL_EP_SERVICES', '/servicios');
  // Relative fallbacks (exclude prefix)
  window.API_REL_EP_PRODUCTS_FALLBACK = LS('API_REL_EP_PRODUCTS_FALLBACK', '/products');
  window.API_REL_EP_SERVICES_FALLBACK = LS('API_REL_EP_SERVICES_FALLBACK', '/servicios');

  // Convenience: full URLs
  window.API_FULL = (path) => {
    const base = (window.API_BASE_URL || '').replace(/\/$/, '');
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${base}${rel}`;
  };
})();

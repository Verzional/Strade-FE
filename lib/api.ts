// lib/api.ts

// Pull the base URL from the environment file. 
// The fallback is useful just in case the .env file is missing.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * A centralized fetch wrapper for authenticated requests
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('strade_token');
  const headers = new Headers(options.headers);
  
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Prepend the base URL automatically!
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * A centralized fetch wrapper for public requests (like Login/Register)
 */
export async function fetchPublic(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Helper to get the exact Google Auth URL so we don't hardcode it in buttons
 */
export function getGoogleAuthUrl() {
  return `${API_BASE_URL}/api/auth/google`;
}
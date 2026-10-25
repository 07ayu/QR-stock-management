/**
 * Centralized API client for Stock Management PWA.
 * Connects to NestJS REST backend via configured base URL.
 * 
 * Note: Browser code never connects directly to PostgreSQL.
 * All stock mutations require an active internet connection.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function checkOnlineStatus(): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('An active internet connection is required to perform stock-changing actions. Offline stock mutations are disabled.');
  }
  return true;
}

export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Demo token header ready for NestJS JWT / session auth
  const token = localStorage.getItem('sm_auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = await res.text();
      }
      throw new ApiError(
        errorData?.message || `HTTP ${res.status}: ${res.statusText}`, 
        res.status, 
        errorData
      );
    }

    // Return json if available
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(`Backend network error connecting to ${url}: ${(error as Error).message}`);
  }
}

/**
 * Registry of backend integration readiness.
 * Documents endpoints expected from the NestJS server.
 */
export const BACKEND_ENDPOINT_REGISTRY = {
  health: { endpoint: '/', method: 'GET', status: 'available' },
  authLogin: { endpoint: '/auth/login', method: 'POST', status: 'pending_backend' },
  authMe: { endpoint: '/auth/me', method: 'GET', status: 'pending_backend' },
  productsList: { endpoint: '/products', method: 'GET', status: 'pending_backend' },
  productsCreate: { endpoint: '/products', method: 'POST', status: 'pending_backend' },
  inventorySummary: { endpoint: '/inventory/summary', method: 'GET', status: 'pending_backend' },
  inventoryItems: { endpoint: '/inventory/items', method: 'GET', status: 'pending_backend' },
  inventoryItemLookup: { endpoint: '/inventory/items/lookup-qr', method: 'GET', status: 'pending_backend' },
  transfersList: { endpoint: '/transfers', method: 'GET', status: 'pending_backend' },
  transfersCreate: { endpoint: '/transfers', method: 'POST', status: 'pending_backend' },
  salesList: { endpoint: '/sales', method: 'GET', status: 'pending_backend' },
  salesCreate: { endpoint: '/sales', method: 'POST', status: 'pending_backend' },
  invoicesList: { endpoint: '/invoices', method: 'GET', status: 'pending_backend' },
  invoicesSendWhatsapp: { endpoint: '/invoices/:id/send-whatsapp', method: 'POST', status: 'pending_backend' },
} as const;

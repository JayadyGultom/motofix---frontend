// Use dynamic URL for Railway or fallback to local proxy
export const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const getAuthToken = () => localStorage.getItem('motofix_token');
export const setAuthToken = (token: string) => localStorage.setItem('motofix_token', token);
export const removeAuthToken = () => localStorage.removeItem('motofix_token');

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            removeAuthToken();
            window.dispatchEvent(new Event('unauthorized'));
        }
        throw new Error(data.error || 'Terjadi kesalahan pada server');
    }

    return data.data; // All Go service responses wrap result in "data" field
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: any) => request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    put: <T>(endpoint: string, body: any) => request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    patch: <T>(endpoint: string, body: any) => request<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body)
    }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

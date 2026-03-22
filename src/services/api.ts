
const VITE_API_URL = import.meta.env.VITE_API_URL || "";
const isProduction = import.meta.env.PROD;
const API_BASE = VITE_API_URL || (isProduction ? `${window.location.origin}/api` : "/api");

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Normalize endpoint: remove leading /api if it exists to avoid double prefixing
  let cleanEndpoint = endpoint;
  if (endpoint.startsWith("/api")) {
    cleanEndpoint = endpoint.slice(4);
  } else if (endpoint.startsWith("api")) {
    cleanEndpoint = endpoint.slice(3);
  }
  
  // Ensure cleanEndpoint starts with a slash if it's not empty
  if (cleanEndpoint && !cleanEndpoint.startsWith("/")) {
    cleanEndpoint = "/" + cleanEndpoint;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data: unknown, options?: RequestInit) => 
    apiFetch<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  put: <T>(endpoint: string, data: unknown, options?: RequestInit) => 
    apiFetch<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  delete: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
  blob: async (endpoint: string, options?: RequestInit) => {
    // Normalize endpoint: remove leading /api if it exists to avoid double prefixing
    let cleanEndpoint = endpoint;
    if (endpoint.startsWith("/api")) {
      cleanEndpoint = endpoint.slice(4);
    } else if (endpoint.startsWith("api")) {
      cleanEndpoint = endpoint.slice(3);
    }
    
    // Ensure cleanEndpoint starts with a slash if it's not empty
    if (cleanEndpoint && !cleanEndpoint.startsWith("/")) {
      cleanEndpoint = "/" + cleanEndpoint;
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE}${cleanEndpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }
};

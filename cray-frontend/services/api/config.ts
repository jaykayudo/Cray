// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    TIMEOUT: 30000, // 30 seconds
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login'
    },
    CAMPAIGNS: {
        LIST: '/campaigns',
        CREATE: '/campaigns',
        GET: (id: string) => `/campaigns/${id}`,
        REGISTER: (id: string) => `/campaigns/${id}/register`,
        VOTE: (id: string) => `/campaigns/${id}/vote`
    }
}; 
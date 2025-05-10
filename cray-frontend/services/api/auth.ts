import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface RegisterRequest {
    username: string;
    passwordHash: string;
    passwordHashProof: string;
}

export interface LoginRequest {
    username: string;
    passwordHash: string;
    passwordHashProof: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: {
        id: number;
        username: string;
        role: string;
    };
}

export const authService = {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    },

    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }
}; 
import { apiClient } from './api/client';

export interface UserProfile {
    id: number;
    username: string;
    name: string;
    createdAt: string;
}

export interface UpdateProfileRequest {
    name: string;
    username: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UserCampaign {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'upcoming' | 'ended';
    registeredVoters: number;
}

export const userService = {
    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get('/api/user/profile');
        return response.data as UserProfile;
    },

    async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
        const response = await apiClient.put('/api/user/profile', data);
        return response.data as UserProfile;
    },

    async changePassword(data: ChangePasswordRequest): Promise<void> {
        await apiClient.put('/api/user/password', data);
    },

    async getCreatedCampaigns(): Promise<UserCampaign[]> {
        const response = await apiClient.get('/api/user/campaigns/created');
        return response.data as UserCampaign[];
    },

    async getRegisteredCampaigns(): Promise<UserCampaign[]> {
        const response = await apiClient.get('/api/user/campaigns/registered');
        return response.data as UserCampaign[];
    }
}; 
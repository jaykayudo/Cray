import { apiClient } from './api/client';

export interface Campaign {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'upcoming' | 'ended';
    options: string[];
    ageRestriction?: number;
    countryRestriction?: string;
    whitelist?: string[];
    restrictions?: string[];
    totalVotes: number;
    creator: {
        id: number;
        name: string;
        username: string;
    };
}

export interface CreateCampaignRequest {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    options: Array<{
        text: string;
    }>;
    restrictions?: string[];
}

export interface RegisterCampaignRequest {
    age_proof?: any;
    country_proof?: any;
    whitelist_proof?: any;
}

export interface RegisterCampaignResponse {
    registrationKey: string;
}

export const campaignsService = {
    async getCampaign(id: number): Promise<Campaign> {
        const response = await apiClient.get(`/api/campaigns/${id}`);
        return response.data as Campaign;
    },

    async listCampaigns(): Promise<Campaign[]> {
        const response = await apiClient.get('/api/campaigns');
        return response.data as Campaign[];
    },

    async createCampaign(data: CreateCampaignRequest): Promise<Campaign> {
        const response = await apiClient.post('/api/campaigns', data);
        return response.data as Campaign;
    },

    async registerForCampaign(campaignId: number, data: RegisterCampaignRequest): Promise<RegisterCampaignResponse> {
        const response = await apiClient.post(`/api/campaigns/${campaignId}/register`, data);
        return response.data as RegisterCampaignResponse;
    },

    async vote(campaignId: number, data: { registrationKey: string; option: string }): Promise<void> {
        await apiClient.post(`/api/campaigns/${campaignId}/vote`, data);
    }
}; 
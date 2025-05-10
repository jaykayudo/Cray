import { apiClient } from './api/client';

export interface Campaign {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'upcoming' | 'ended';
    totalVotes: number;
    isRegistered: boolean;
}

export const campaignsService = {
    async listCampaigns(): Promise<Campaign[]> {
        const response = await apiClient.get('/api/campaigns');
        return response.data as Campaign[];
    },

    async getCampaign(id: number): Promise<Campaign> {
        const response = await apiClient.get(`/api/campaigns/${id}`);
        return response.data as Campaign;
    },

    async registerForCampaign(campaignId: number): Promise<void> {
        await apiClient.post(`/api/campaigns/${campaignId}/register`);
    },

    async vote(campaignId: number, vote: number): Promise<void> {
        await apiClient.post(`/api/campaigns/${campaignId}/vote`, { vote });
    }
}; 
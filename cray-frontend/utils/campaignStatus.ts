import { Campaign } from "@/services/campaigns"

export type CampaignStatus = "upcoming" | "active" | "closed"

export const isCampaignClosed = (campaign: Campaign): boolean => {
  const now = new Date()
  const endDate = new Date(campaign.endDate)
  return endDate < now
}

export const isCampaignUpcoming = (campaign: Campaign): boolean => {
  const now = new Date()
  const startDate = new Date(campaign.startDate)
  return startDate > now
}

export const isCampaignActive = (campaign: Campaign): boolean => {
  const now = new Date()
  const startDate = new Date(campaign.startDate)
  const endDate = new Date(campaign.endDate)
  return startDate <= now && endDate > now
}

export const getCampaignStatus = (campaign: Campaign): CampaignStatus => {
  if (isCampaignClosed(campaign)) return "closed"
  if (isCampaignUpcoming(campaign)) return "upcoming"
  return "active"
} 
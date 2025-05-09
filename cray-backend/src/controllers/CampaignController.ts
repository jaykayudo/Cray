import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Campaign } from "../entities/Campaign";
import { User } from "../entities/User";
import { randomBytes } from "crypto";
import { createHash } from "crypto";
import { ProofVerification } from "../utils/proofVerification";

const campaignRepository = AppDataSource.getRepository(Campaign);
const userRepository = AppDataSource.getRepository(User);

export class CampaignController {
    async createCampaign(req: Request, res: Response) {
        try {
            const {
                name,
                description,
                options,
                ageRestriction,
                countryRestriction,
                whitelist,
                startTime,
                endTime
            } = req.body;

            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const creator = await userRepository.findOne({ where: { id: userId } });
            if (!creator) {
                return res.status(404).json({ message: "User not found" });
            }

            const campaign = new Campaign();
            campaign.name = name;
            campaign.description = description;
            campaign.options = options;
            campaign.ageRestriction = ageRestriction;
            campaign.countryRestriction = countryRestriction;
            campaign.whitelist = whitelist;
            campaign.startTime = new Date(startTime);
            campaign.endTime = new Date(endTime);
            campaign.creator = creator;

            await campaignRepository.save(campaign);

            return res.status(201).json({
                message: "Campaign created successfully",
                campaign: {
                    id: campaign.id,
                    name: campaign.name,
                    description: campaign.description,
                    options: campaign.options,
                    ageRestriction: campaign.ageRestriction,
                    countryRestriction: campaign.countryRestriction,
                    whitelist: campaign.whitelist,
                    startTime: campaign.startTime,
                    endTime: campaign.endTime,
                    creator: {
                        id: creator.id,
                        fullName: creator.fullName,
                        username: creator.username
                    }
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async registerForCampaign(req: Request, res: Response) {
        try {
            const { campaignId } = req.params;
            const {
                age_proof,
                country_proof,
                whitelist_proof,
            } = req.body;

            const campaign = await campaignRepository.findOne({
                where: { id: campaignId }
            });
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }
            if (!campaign.canRegister()) {
                return res.status(400).json({ message: "Campaign registration has ended" });
            }

            // Verify age proof if age restriction exists
            if (campaign.ageRestriction && age_proof) {
                const age = campaign.ageRestriction;
                const isAgeValid = await ProofVerification.verifyAgeProof(age_proof, { age });
                if (!isAgeValid) {
                    return res.status(403).json({ message: "Invalid age proof" });
                }
               
            }

            // Verify country proof if country restriction exists
            if (campaign.countryRestriction && country_proof) {
                const country = campaign.countryRestriction;
                const isCountryValid = await ProofVerification.verifyCountryProof(country_proof, { country });
                if (!isCountryValid) {
                    return res.status(403).json({ message: "Invalid country proof" });
                }
                
            }

            // Verify whitelist proof if whitelist exists
            if (campaign.whitelist && campaign.whitelist.length > 0 && whitelist_proof) {
                const whitelist = campaign.whitelist;
                const isWhitelisted = await ProofVerification.verifyWhitelistProof(whitelist_proof, { whitelist });
                if (!isWhitelisted) {
                    return res.status(403).json({ message: "User is not in the whitelist" });
                }
            }

            // Generate registration key and hash
            const registrationKey = randomBytes(32).toString('hex');
            const registrationHash = createHash('sha256').update(registrationKey).digest('hex');

            // Add hash to campaign's registered voters
            campaign.registeredVoterHashes.push(registrationHash);
            campaign.numberOfRegisteredVoters += 1;
            await campaignRepository.save(campaign);

            return res.status(200).json({
                message: "Successfully registered for campaign",
                registrationKey // This key should be securely stored by the user
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async vote(req: Request, res: Response) {
        try {
            const { campaignId } = req.params;
            const { registrationKey, option } = req.body;

            const campaign = await campaignRepository.findOne({
                where: { id: campaignId }
            });

            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }

            if (!campaign.canVote()) {
                return res.status(400).json({ message: "Campaign is not active" });
            }

            // Verify registration
            const registrationHash = createHash('sha256').update(registrationKey).digest('hex');
            if (!campaign.registeredVoterHashes.includes(registrationHash)) {
                return res.status(403).json({ message: "Invalid registration key" });
            }

            // Verify option
            if (!campaign.options.includes(option)) {
                return res.status(400).json({ message: "Invalid option" });
            }

            // Record vote
            campaign.votes.push(option);
            campaign.numberOfVotes += 1;

            // Remove the registration hash to prevent double voting
            campaign.registeredVoterHashes = campaign.registeredVoterHashes.filter(
                hash => hash !== registrationHash
            );

            await campaignRepository.save(campaign);

            return res.status(200).json({
                message: "Vote recorded successfully"
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async getCampaign(req: Request, res: Response) {
        try {
            const { campaignId } = req.params;

            const campaign = await campaignRepository.findOne({
                where: { id: campaignId },
                relations: ["creator"]
            });

            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }

            return res.status(200).json({
                campaign: {
                    id: campaign.id,
                    name: campaign.name,
                    description: campaign.description,
                    options: campaign.options,
                    ageRestriction: campaign.ageRestriction,
                    countryRestriction: campaign.countryRestriction,
                    whitelist: campaign.whitelist,
                    startTime: campaign.startTime,
                    endTime: campaign.endTime,
                    numberOfRegisteredVoters: campaign.numberOfRegisteredVoters,
                    numberOfVotes: campaign.numberOfVotes,
                    creator: {
                        id: campaign.creator.id,
                        fullName: campaign.creator.fullName,
                        username: campaign.creator.username
                    }
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async listCampaigns(req: Request, res: Response) {
        try {
            const campaigns = await campaignRepository.find({
                relations: ["creator"]
            });

            return res.status(200).json({
                campaigns: campaigns.map(campaign => ({
                    id: campaign.id,
                    name: campaign.name,
                    description: campaign.description,
                    options: campaign.options,
                    ageRestriction: campaign.ageRestriction,
                    countryRestriction: campaign.countryRestriction,
                    whitelist: campaign.whitelist,
                    startTime: campaign.startTime,
                    endTime: campaign.endTime,
                    numberOfRegisteredVoters: campaign.numberOfRegisteredVoters,
                    numberOfVotes: campaign.numberOfVotes,
                    creator: {
                        id: campaign.creator.id,
                        fullName: campaign.creator.fullName,
                        username: campaign.creator.username
                    }
                }))
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
} 
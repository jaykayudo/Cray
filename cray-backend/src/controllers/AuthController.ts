import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { sign } from "jsonwebtoken";
import { ProofVerification } from "../utils/proofVerification";
import { Not } from "typeorm";

const userRepository = AppDataSource.getRepository(User);

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { fullName, username, passwordHash, passwordHashProof } = req.body;

            const existingUser = await userRepository.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: "Username already registered" });
            }

            // Verify password hash proof
            const isPasswordHashValid = await ProofVerification.verifyPasswordProof(
                passwordHashProof,
                { passwordHash }
            );

            if (!isPasswordHashValid) {
                return res.status(400).json({ message: "Invalid password hash proof" });
            }

            const user = new User();
            user.fullName = fullName;
            user.username = username;
            user.password = passwordHash; // Store the hash directly

            await userRepository.save(user);

            const token = sign({ userId: user.id }, process.env.JWT_SECRET || "default_secret", {
                expiresIn: "1d",
            });

            return res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    username: user.username
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { username, passwordHashProof } = req.body;

            const user = await userRepository.findOne({ where: { username } });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Verify password hash proof
            const isPasswordHashValid = await ProofVerification.verifyPasswordProof(
                passwordHashProof,
                { passwordHash: user.password }
            );

            if (!isPasswordHashValid) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = sign({ userId: user.id }, process.env.JWT_SECRET || "default_secret", {
                expiresIn: "1d",
            });

            return res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    username: user.username
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async getPasswordHash(req: Request, res: Response) {
        try {
            const { username } = req.params;
            
            const user = await userRepository.findOne({
                where: { username },
                select: { password: true }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.json({ passwordHash: user.password });
        } catch (error) {
            console.error('Error getting password hash:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const user = await userRepository.findOne({ 
                where: { id: userId },
                select: {
                    id: true,
                    fullName: true,
                    username: true,
                    createdAt: true
                }
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.json({
                id: user.id,
                name: user.fullName,
                username: user.username,
                createdAt: user.createdAt
            });
        } catch (error) {
            console.error('Error getting profile:', error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { name, username } = req.body;

            // Check if username is already taken by another user
            if (username) {
                const existingUser = await userRepository.findOne({ 
                    where: { 
                        username,
                        id: Not(userId)
                    }
                });
                if (existingUser) {
                    return res.status(400).json({ message: "Username already taken" });
                }
            }

            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Update user fields
            if (name) user.fullName = name; 
            if (username) user.username = username;

            await userRepository.save(user);

            return res.json({
                id: user.id,
                name: user.fullName,
                username: user.username,
                createdAt: user.createdAt
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { currentPasswordProof, newPasswordHash, newPasswordHashProof } = req.body;

            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Verify current password
            const isCurrentPasswordValid = await ProofVerification.verifyPasswordProof(
                currentPasswordProof,
                { passwordHash: user.password }
            );

            if (!isCurrentPasswordValid) {
                return res.status(401).json({ message: "Current password is incorrect" });
            }

            // Verify new password hash proof
            const isNewPasswordHashValid = await ProofVerification.verifyPasswordProof(
                newPasswordHashProof,
                { passwordHash: newPasswordHash }
            );

            if (!isNewPasswordHashValid) {
                return res.status(400).json({ message: "Invalid new password hash proof" });
            }

            // Update password
            user.password = newPasswordHash;
            await userRepository.save(user);

            return res.json({ message: "Password updated successfully" });
        } catch (error) {
            console.error('Error changing password:', error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
} 
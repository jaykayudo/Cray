import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { sign } from "jsonwebtoken";
import { ProofVerification } from "../utils/proofVerification";

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
} 
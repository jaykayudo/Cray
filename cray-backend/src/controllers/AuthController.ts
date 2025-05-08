import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(User);

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { fullName, email, password, age, country } = req.body;

            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already registered" });
            }

            const user = new User();
            user.fullName = fullName;
            user.email = email;
            user.password = password;
            if (age) user.age = age;
            if (country) user.country = country;

            await user.hashPassword();
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
                    email: user.email,
                    age: user.age,
                    country: user.country,
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await userRepository.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const isValidPassword = await compare(password, user.password);
            if (!isValidPassword) {
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
                    email: user.email,
                    age: user.age,
                    country: user.country,
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
} 
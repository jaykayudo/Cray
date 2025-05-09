import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
            };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = verify(token, process.env.JWT_SECRET || "default_secret") as { userId: string };
        req.user = { userId: decoded.userId };
        
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}; 
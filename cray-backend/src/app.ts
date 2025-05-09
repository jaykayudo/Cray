import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import { AuthController } from "./controllers/AuthController";
import { CampaignController } from "./controllers/CampaignController";
import { authMiddleware } from "./middleware/auth";

dotenv.config();

const app = express();
const authController = new AuthController();
const campaignController = new CampaignController();

app.use(cors());
app.use(express.json());

// Auth routes
app.post("/api/auth/register", authController.register.bind(authController));
app.post("/api/auth/login", authController.login.bind(authController));

// Campaign routes
app.post("/api/campaigns", authMiddleware, campaignController.createCampaign.bind(campaignController));
app.get("/api/campaigns", campaignController.listCampaigns.bind(campaignController));
app.get("/api/campaigns/:campaignId", campaignController.getCampaign.bind(campaignController));
app.post("/api/campaigns/:campaignId/register", campaignController.registerForCampaign.bind(campaignController));
app.post("/api/campaigns/:campaignId/vote", campaignController.vote.bind(campaignController));

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected successfully");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => console.log("Error connecting to database:", error)); 
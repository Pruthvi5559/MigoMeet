import express from "express"
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initDB } from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import { handledClerkWebhook } from "./controllers/webhookController.js";
import meetingRouter from "./routes/meetingRoutes.js";

const app = express();

const allowedOrigins = (process.env.ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(cookieParser())

app.use("/api/clerk", express.raw({type: "application/json"}), handledClerkWebhook)
app.use(express.json())
app.use(clerkMiddleware())

app.get("/", (req, res)=> res.send("API is Live"))
app.use("/api/meetings", meetingRouter)

const port = process.env.PORT || 3000;

async function startServer() {
    await initDB();
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to initialize the server:", error);
    process.exitCode = 1;
});
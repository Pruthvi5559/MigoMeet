import express from "express";
import { createMeeting, getMeeting, getMeetingStats, getSessionDetails, getUserSession } from "../controllers/meetingController.js";
import { protect } from "../middleware/auth.js";

const meetingRouter = express.Router();

meetingRouter.post("/", protect, createMeeting);
meetingRouter.get("/stats", protect, getMeetingStats);
meetingRouter.get("/sessions", protect, getUserSession);
meetingRouter.get("/sessions/:id", protect, getSessionDetails);
meetingRouter.get("/:meetingId", protect, getMeeting);

export default meetingRouter;
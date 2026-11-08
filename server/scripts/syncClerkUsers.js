import "dotenv/config";
import { clerkClient } from "@clerk/express";
import { initDB } from "../config/db.js";
import { upsertUser } from "../services/userSync.js";

const pageSize = 100;

async function syncClerkUsers() {
    await initDB();

    let offset = 0;
    let syncedCount = 0;

    while (true) {
        const { data: users } = await clerkClient.users.getUserList({
            limit: pageSize,
            offset,
        });

        await Promise.all(users.map((user) => upsertUser({
            id: user.id,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "User",
            email: user.primaryEmailAddress?.emailAddress,
            image: user.imageUrl,
        })));

        syncedCount += users.length;
        if (users.length < pageSize) {
            break;
        }

        offset += users.length;
    }

    console.log(`Synced ${syncedCount} Clerk users to Neon.`);
}

syncClerkUsers().catch((error) => {
    console.error("Failed to sync Clerk users to Neon:", error);
    process.exitCode = 1;
});

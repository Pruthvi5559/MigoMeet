import { sql } from "../config/db.js";

export async function upsertUser({ id, name, email, image }) {
    if (!id) {
        throw new Error("Cannot sync a Clerk user without an ID");
    }

    await sql`
        INSERT INTO users (id, name, email, image, plan)
        VALUES (${id}, ${name?.trim() || "User"}, ${email || null}, ${image || null}, 'free')
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            image = EXCLUDED.image,
            updated_at = NOW()
    `;
}

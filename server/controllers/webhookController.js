import { verifyWebhook } from '@clerk/express/webhooks'
import { sql } from "../config/db.js"
import { upsertUser } from "../services/userSync.js"

const getUserEmail = (user) => user.email_addresses?.find(
    (email) => email.id === user.primary_email_address_id
)?.email_address || user.email_addresses?.[0]?.email_address || null;

const getUserName = (user) => [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ") || "User";

export const handledClerkWebhook = async (req, res) => {
    try {
        const evt = await verifyWebhook(req)

        const eventType = evt.type;
        const data = evt.data;

        switch (eventType) {
            case "user.created":{
                await upsertUser({
                    id: data.id,
                    name: getUserName(data),
                    email: getUserEmail(data),
                    image: data.image_url,
                });
                break;
            } 

            case "user.updated":{
                await upsertUser({
                    id: data.id,
                    name: getUserName(data),
                    email: getUserEmail(data),
                    image: data.image_url,
                });
                break;
            } 

            case "user.deleted":{
                const userId = data.id;
                if(userId){
                    await sql`DELETE FROM users WHERE id = ${userId}`;
                }
                break;
            }
        
            default:
                console.log(`Unhandled Clerk webhook event type: ${eventType}`);
        }
        return res.status(200).json({ success: true, eventType });
    } catch (error) {
        console.error("Error processing Clerk webhook:", error);
        const message = error instanceof Error ? error.message : String(error);
        return res.status(400).json({error: "Webhook processing failed: " + message});
    }
}
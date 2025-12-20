import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/web-push";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
        
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { title, message, url, targetType } = await req.json();

        if (!title || !message) {
            return NextResponse.json(
                { error: "Title and message are required" },
                { status: 400 }
            );
        }

        // 1. Determine Target Audience
        let whereClause: any = {};
        
        switch (targetType) {
            case 'active_7days':
                whereClause = {
                    lastActivityAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                };
                break;
            case 'high_score':
                whereClause = {
                    points: {
                        gte: 1000
                    }
                };
                break;
            case 'all':
            default:
                whereClause = {};
                break;
        }

        // Fetch users with their push subscriptions
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                pushSubscriptions: true
            }
        });

        console.log(`Sending notification to ${users.length} users (Target: ${targetType})`);

        // 2. Create In-App Notifications (Bulk Insert)
        if (users.length > 0) {
            await prisma.notification.createMany({
                data: users.map(u => ({
                    userId: u.id,
                    type: 'admin_broadcast',
                    title,
                    message,
                    isRead: false
                }))
            });
        }

        // 3. Send Push Notifications
        let successCount = 0;
        let failureCount = 0;

        const payload = {
            title,
            body: message,
            icon: '/icons/icon-192x192.png',
            url: url || '/inbox',
            type: 'admin_broadcast'
        };

        const pushPromises = [];

        for (const user of users) {
             if (user.pushSubscriptions.length > 0) {
                 for (const sub of user.pushSubscriptions) {
                     const subscription = {
                         endpoint: sub.endpoint,
                         keys: {
                             p256dh: sub.p256dh,
                             auth: sub.auth
                         }
                     };
                     pushPromises.push(
                         sendPushNotification(subscription, payload)
                             .then(() => successCount++)
                             .catch(() => failureCount++)
                     );
                 }
             }
        }

        await Promise.all(pushPromises);

        return NextResponse.json({
            success: true,
            targetedUsers: users.length,
            pushSent: successCount,
            pushFailed: failureCount
        });

    } catch (error) {
        console.error("Failed to send broadcast:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

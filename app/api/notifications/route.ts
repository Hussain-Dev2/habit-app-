import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

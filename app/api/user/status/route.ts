import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
            isBanned: true, 
            banExpiresAt: true,
            isChatBlocked: true,
            chatBlockExpiresAt: true
        }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if ban expired
    if (user.isBanned && user.banExpiresAt && new Date(user.banExpiresAt) < new Date()) {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { isBanned: false, banExpiresAt: null }
        });
        return NextResponse.json({ isBanned: false });
    }

    return NextResponse.json(user);
}

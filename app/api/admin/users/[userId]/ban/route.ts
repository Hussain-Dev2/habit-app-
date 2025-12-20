import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        
        // Check Admin Auth
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const admin = await prisma.user.findUnique({
             where: { email: session.user.email },
             select: { isAdmin: true }
        });

        if (!admin?.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { type, duration } = body; // type: 'ban_app' | 'block_chat'
        const userId = params.userId;

        let expiresAt: Date | null = null;
        if (duration !== 'permanent') {
            const now = new Date();
            // duration in minutes or specific keywords
            if (duration === '1h') now.setHours(now.getHours() + 1);
            else if (duration === '24h') now.setHours(now.getHours() + 24);
            else if (duration === '7d') now.setDate(now.getDate() + 7);
            else if (typeof duration === 'number') now.setMinutes(now.getMinutes() + duration);
            
            expiresAt = now;
        }

        if (type === 'ban_app') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isBanned: true,
                    banExpiresAt: expiresAt
                }
            });
        } else if (type === 'block_chat') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isChatBlocked: true,
                    chatBlockExpiresAt: expiresAt
                }
            });
        }

        return NextResponse.json({ success: true, expiresAt });

    } catch (error) {
        console.error("Ban API Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
         if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
         
         const admin = await prisma.user.findUnique({
             where: { email: session.user.email },
             select: { isAdmin: true }
        });
        if (!admin?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const url = new URL(req.url);
        const type = url.searchParams.get('type'); // 'ban_app' or 'block_chat'
        const userId = params.userId;

        if (type === 'ban_app') {
             await prisma.user.update({
                where: { id: userId },
                data: { isBanned: false, banExpiresAt: null }
            });
        } else if (type === 'block_chat') {
             await prisma.user.update({
                where: { id: userId },
                data: { isChatBlocked: false, chatBlockExpiresAt: null }
            });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

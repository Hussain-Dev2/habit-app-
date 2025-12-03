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
        
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
        
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { points } = await req.json();

        if (!points || points <= 0) {
            return NextResponse.json(
                { error: "Points must be greater than 0" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: params.userId },
            data: {
                points: {
                    increment: points,
                },
            },
            select: {
                id: true,
                email: true,
                points: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to add points:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

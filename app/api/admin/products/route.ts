/**
 * Admin Products API Route
 * 
 * Manages product CRUD operations for the digital store.
 * Only accessible by users with admin privileges.
 * 
 * Features:
 * - List all products
 * - Create new products
 * - Update product details
 * - Delete products
 * - Admin-only access control
 * 
 * Security:
 * - Requires NextAuth session
 * - Validates isAdmin flag from database
 * - Input validation for required fields
 * - SQL injection prevention via Prisma
 * 
 * @route GET /api/admin/products - List all products
 * @route POST /api/admin/products - Create new product
 * @access Admin only
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * Force dynamic rendering - no caching for admin routes
 * Ensures fresh data on every request
 */
export const dynamic = 'force-dynamic';

/**
 * GET handler - Retrieve all products
 * 
 * Returns all products ordered by creation date (newest first).
 * Includes all product fields: title, description, cost, stock, etc.
 * 
 * @returns JSON array of product objects
 * 
 * @example Response
 * ```json
 * [
 *   {
 *     "id": "123",
 *     "title": "Premium Gift Card",
 *     "costPoints": 1000,
 *     "stock": 50,
 *     "createdAt": "2024-01-01T00:00:00.000Z"
 *   }
 * ]
 * ```
 */
export async function GET(req: Request) {
    try {
        // Step 1: Authenticate user
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in as an admin" }, 
                { status: 401 }
            );
        }

        // Step 2: Verify admin privileges
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { isAdmin: true }, // Only fetch isAdmin flag for performance
        });
        
        if (!user || !user.isAdmin) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" }, 
                { status: 403 }
            );
        }

        // Step 3: Fetch all products
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }, // Newest products first
        });
        
        return NextResponse.json(products);
    } catch (error) {
        // Log error for debugging (don't expose to client)
        console.error('Admin products GET error:', error);
        
        return NextResponse.json(
            { error: "Internal Server Error - Failed to fetch products" },
            { status: 500 }
        );
    }
}

/**
 * POST handler - Create new product
 * 
 * Creates a new product in the store with provided details.
 * Validates required fields and admin permissions.
 * 
 * Required fields:
 * - title: Product name
 * - costPoints: Price in points (must be positive)
 * 
 * Optional fields:
 * - description: Product description
 * - stock: Available quantity (null = unlimited)
 * - imageUrl: Product image URL
 * - category: Product category (e.g., "Gift Card", "Game Code")
 * - value: Real-world value (e.g., "$10")
 * - region: Geographic restriction (e.g., "US", "Global")
 * 
 * @returns JSON of created product
 * 
 * @example Request Body
 * ```json
 * {
 *   "title": "Steam $10 Gift Card",
 *   "description": "Redeem on Steam",
 *   "costPoints": 950,
 *   "stock": 100,
 *   "category": "Gift Card",
 *   "value": "$10",
 *   "region": "Global"
 * }
 * ```
 */
export async function POST(req: Request) {
    try {
        // Step 1: Authenticate user
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in as an admin" }, 
                { status: 401 }
            );
        }

        // Step 2: Verify admin privileges
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { isAdmin: true },
        });
        
        if (!user || !user.isAdmin) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" }, 
                { status: 403 }
            );
        }

        // Step 3: Parse and validate request body
        const { title, description, costPoints, stock, imageUrl, category, value, region, isDigital } = await req.json();
        
        // Validate required fields
        if (!title || !costPoints) {
            return NextResponse.json(
                { error: "Missing required fields: title and costPoints are required" },
                { status: 400 }
            );
        }
        
        // Validate costPoints is positive
        if (typeof costPoints !== 'number' || costPoints <= 0) {
            return NextResponse.json(
                { error: "Invalid costPoints: must be a positive number" },
                { status: 400 }
            );
        }
        
        // Validate stock if provided
        if (stock !== null && stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
            return NextResponse.json(
                { error: "Invalid stock: must be a non-negative number or null for unlimited" },
                { status: 400 }
            );
        }
        const product = await prisma.product.create({
            data: {
                title,
                description: description || '',
                costPoints,
                stock: stock ?? null,
                imageUrl: imageUrl ?? null,
                category: category ?? null,
                value: value ?? null,
                region: region ?? null,
                isDigital: isDigital !== undefined ? isDigital : true,
            },
        });
        
        return NextResponse.json(product);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
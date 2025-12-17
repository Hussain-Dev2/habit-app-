import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // PrismaAdapter handles user creation automatically
        // Just ensure the user has required fields initialized
        if (user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // If user was just created by adapter, initialize their fields
          if (existingUser && existingUser.points === 0 && !existingUser.lastActivityAt) {
            // Store user ID in token/session for referral processing
            (user as any).isNewUser = true;
            (user as any).userId = existingUser.id;
            
            await prisma.user.update({
              where: { email: user.email },
              data: {
                points: 0,
                clicks: 0,
                dailyEarnings: 0,
                lifetimePoints: 0,
                pointsFromAds: 0,
                pointsFromTasks: 0,
                lastActivityAt: new Date(),
                lastDailyReset: new Date(),
                streakDays: 0,
                totalSessionTime: 0,
                adWatchCount: 0,
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return true; // Still allow sign in even if initialization fails
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        (session.user as any).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
};

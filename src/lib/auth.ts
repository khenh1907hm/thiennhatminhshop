import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu.");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user?.password) {
          throw new Error("Sai email hoặc mật khẩu.");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Sai email hoặc mật khẩu.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roleCheckedAt = Date.now();
        return token;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      // Re-read role from DB so demoted users lose admin access
      const checkedAt = typeof token.roleCheckedAt === "number" ? token.roleCheckedAt : 0;
      const shouldRefresh = !checkedAt || Date.now() - checkedAt > 30_000;

      if (token.id && shouldRefresh) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: String(token.id) },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "USER";
          token.roleCheckedAt = Date.now();
        } catch (err) {
          console.error("Failed to refresh user role:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export async function getUserIdFromSession(session: any): Promise<string | null> {
  if (!session?.user) return null;
  if (session.user.id) return String(session.user.id);
  if (session.user.sub) return String(session.user.sub);
  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    return user ? user.id : null;
  }
  return null;
}

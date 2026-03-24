import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Phone Number",
      credentials: {
        phone: { label: "Phone Number", type: "text", placeholder: "+91 9999999999" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;
        
        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        });

        // Auto-create user for demo if pass is 1234
        if (credentials.password === "1234") {
          if (!user) {
            user = await prisma.user.create({
              data: {
                phone: credentials.phone,
                name: "Farmer",
              }
            });
          }
          return { id: user.id.toString(), name: user.name, phone: user.phone };
        }
        
        if (user && credentials.password === "1234") {
             return { id: user.id.toString(), name: user.name, phone: user.phone };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key-for-local-dev-only",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

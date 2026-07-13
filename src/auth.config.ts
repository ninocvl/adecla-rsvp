import type { NextAuthConfig } from "next-auth";

// Configuración compartida, segura para el edge runtime (sin Prisma ni bcrypt).
// La usa el middleware; auth.ts la extiende con el provider de credenciales.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.companyId = token.companyId;
      session.user.companyName = token.companyName;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

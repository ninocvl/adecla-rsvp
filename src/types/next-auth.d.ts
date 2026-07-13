import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "COMPANY";
      companyId?: string;
      companyName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "COMPANY";
    companyId?: string;
    companyName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "COMPANY";
    companyId?: string;
    companyName?: string;
  }
}

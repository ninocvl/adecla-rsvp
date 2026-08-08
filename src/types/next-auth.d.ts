import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/enums";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      companyId?: string;
      companyName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    companyId?: string;
    companyName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    companyId?: string;
    companyName?: string;
  }
}

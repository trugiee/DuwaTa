// Type augmentations for NextAuth

import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      teamId: string | null;
      teamName: string | null;
    };
  }

  interface User {
    role: Role;
    teamId: string | null;
    teamName: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    teamId: string | null;
    teamName: string | null;
  }
}

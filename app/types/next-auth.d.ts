import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

import { DatabaseType } from "./supabase";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      jwt: JWT;
      active: boolean | null
      address: string | null
      birth_date: number | null
      created_at: string
      email: string
      enrollment_date: string
      id: number
      major: string | null
      name: string
      phone: number | null
      semester: number | null
      surname: string
      admin: boolean | null
      speciality: string | null
    }
  }
}
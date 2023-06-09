import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      token: JWT;
      active: boolean;
      address: string | null;
      birth_date: number | null;
      created_at: string | null;
      email: string;
      enrollment_date: string;
      id: number;
      major: number | null;
      name: string;
      phone: number | null;
      semester: number | null;
      surname: string;
      speciality: string | null;
      admin: boolean;
      head_of_deparment_id: number;
      userType: 'student' | 'doctor' | 'admin';
    };
  }
}
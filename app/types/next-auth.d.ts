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
      head_of_department_id: number |null;
      semester: number | null;
      surname: string;
      speciality: string | null;
      admin: boolean;
      advisor: number;
      number: number;
      graduated: boolean;
      userType: 'student' | 'doctor' | 'admin';
    };
  }
}
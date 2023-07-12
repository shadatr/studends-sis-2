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
      advisor: number;
<<<<<<< HEAD
      graduated:boolean;
=======
      number: number;
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
      userType: 'student' | 'doctor' | 'admin';
    };
  }
}
import { createHash } from "crypto";

import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "admin login",
      id: "admin_login",


      credentials: {
        email: {
          label: "email",
          type: "text",
          placeholder: "jsmith",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials as any;

        const { data, error } = await supabase.from("tb_students_info").select("*").eq("email", email).eq("password", password);
        console.log(data);
        if (!data && error || data && data.length === 0) {
          return null;
        } else {
          return data[0] as any;
        }
      },
    }),
    CredentialsProvider({
      name: "professor login",
      id: "professor_login",


      credentials: {
        email: {
          label: "email",
          type: "text",
          placeholder: "jsmith",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials as any;

        const { data, error } = await supabase.from("tb_students_info").select("*").eq("email", email).eq("password", password);
        console.log(data);
        if (!data && error || data && data.length === 0) {
          return null;
        } else {
          return data[0] as any;
        }
      },
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "student login",
      id: "student_login",


      credentials: {
        email: {
          label: "email",
          type: "text",
          placeholder: "jsmith",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials as any;
        const passwordHash = createHash('sha256').update(password).digest('hex');
        const { data, error } = await supabase.from("tb_students").select("*").eq("email", email).eq("password", passwordHash);
        if (!data && error || data && data.length === 0) {
          return null;
        } else {
          return data[0] as any;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      console.log(token);
      session.user.jwt = token;
      session.user.id = token.id as any;
      session.user.email = token.email as any;
      session.user.name = token.name as any;
      session.user.surname = token.surname as any;
      session.user.active = token.active as any;
      session.user.address = token.address as any;
      session.user.birth_date = token.birth_date as any;
      session.user.created_at = token.created_at as any;
      session.user.enrollment_date = token.enrollment_date as any;
      session.user.major = token.major as any;
      session.user.phone = token.phone as any;
      session.user.semester = token.semester as any;
      
      return session;
    },
  },
  // A database is optional, but required to persist accounts in a database
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
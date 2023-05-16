import { createHash } from "crypto";

import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({
    name: "admin",
    id: 'admin',
    credentials: {
      email: {
        label: "البريد الالكتروني",
        type: "text",
        placeholder: "email@example.com",
      },
      password: {
        label: "كلمة المرور",
        type: "password",
      },
    },
    async authorize(credentials, req) {
      const { email, password } = credentials as any;
      const passwordHash = createHash('sha256').update(password).digest('hex');

      const { data, error } = await supabase
        .from('tb_admins')
        .select('*')
        .eq('email', email)
        .eq('password', passwordHash);

      if (!data && error || data && data.length === 0) {

        return null;
      } else {

        return data[0] as any;
      }
    },
  }),
    CredentialsProvider({
      name: "professor",
      id: 'professor',
      credentials: {
        email: {
          label: "البريد الالكتروني",
          type: "text",
          placeholder: "email@example.com",
        },
        password: {
          label: "كلمة المرور",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        const { email, password } = credentials as any;
        const passwordHash = createHash('sha256').update(password).digest('hex');

        const { data, error } = await supabase
          .from('tb_doctors')
          .select('*')
          .eq('email', email)
          .eq('password', passwordHash);

        if (!data && error || data && data.length === 0) {

          return null;
        } else {

          return data[0] as any;
        }
      },
    }),
    CredentialsProvider({
      name: "Student",
      id: 'student',

      credentials: {
        email: {
          label: "البريد الالكتروني",
          type: "text",
          placeholder: "email@example.com",
        },
        password: {
          label: "كلمة المرور",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        const { email, password } = credentials as any;
        const passwordHash = createHash('sha256').update(password).digest('hex');

        const { data, error } = await supabase
          .from('tb_students')
          .select('*')
          .eq('email', email)
          .eq('password', passwordHash);

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
    async session({ session, token, user }) {
      session.user = token;

      return session;
    },
  },

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
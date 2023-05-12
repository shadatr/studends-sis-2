import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    // ...add more providers here
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",


      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "jsmith",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        const { username, password } = credentials as any;
      
        console.log("auth");
        const { data, error } = await supabase
          .from('tb_students_login')
          .select('*')
          .eq('username', username)
          .eq('password', password);
        const data1 = await supabase.from('tb_students_login').select('*');
        console.log(data);
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

  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
import { createHash } from 'crypto';

import { Client } from 'pg';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';



const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'admin',
      id: 'admin',
      credentials: {
        email: {
          label: 'البريد الالكتروني',
          type: 'text',
          placeholder: 'email@example.com',
        },
        password: {
          label: 'كلمة المرور',
          type: 'password',
        },
      },
      
      async authorize(credentials) {
        const { email, password } = credentials as any;
        const passwordHash = createHash('sha256')
          .update(password)
          .digest('hex');

          const client = new Client({
            user: process.env.DB_USERNAME || '',
            password: process.env.DB_PASSWORD || '',
            host: process.env.DB_HOST || '',
            database: process.env.DB_NAME || '',
            port: Number(process.env.DB_PORT),
          });

        await client.connect();

        const queryResult = await client.query(
          'SELECT * FROM tb_admins WHERE email = $1 AND password = $2 AND active = TRUE',
          [email, passwordHash]
        );

        await client.end();

        const data = queryResult.rows;

        if ((!data ) || (data && data.length === 0)) {
          return null;
        } else {
          const userObj = data[0] as any;
          userObj.userType = 'admin';
          return data[0] as any;
        }
      },
    }),
    CredentialsProvider({
      name: 'professor',
      id: 'professor',
      credentials: {
        email: {
          label: 'البريد الالكتروني',
          type: 'text',
          placeholder: 'email@example.com',
        },
        password: {
          label: 'كلمة المرور',
          type: 'password',
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials as any;
        const passwordHash = createHash('sha256')
          .update(password)
          .digest('hex');

          const client = new Client({
            user: process.env.DB_USERNAME || '',
            password: process.env.DB_PASSWORD || '',
            host: process.env.DB_HOST || '',
            database: process.env.DB_NAME || '',
            port: Number(process.env.DB_PORT),
          });

        await client.connect();

        const queryResult = await client.query(
          'SELECT * FROM tb_doctors WHERE email = $1 AND password = $2 AND active = TRUE',
          [email, passwordHash]
        );

        await client.end();

        const data = queryResult.rows;

        if ((!data) || (data && data.length === 0)) {
          return null;
        } else {
          const userObj = data[0] as any;
          userObj.userType = 'doctor';
          return data[0] as any;
        }
      },
    }),
    CredentialsProvider({
      name: 'student',
      id: 'student',

      credentials: {
        email: {
          label: 'البريد الالكتروني',
          type: 'text',
          placeholder: 'email@example.com',
        },
        password: {
          label: 'كلمة المرور',
          type: 'password',
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials as any;
        const passwordHash = createHash('sha256')
          .update(password)
          .digest('hex');

          const client = new Client({
            user: process.env.DB_USERNAME || '',
            password: process.env.DB_PASSWORD || '',
            host: process.env.DB_HOST || '',
            database: process.env.DB_NAME || '',
            port: Number(process.env.DB_PORT),
          });

       await client.connect();

       const queryResult = await client.query(
         'SELECT * FROM tb_students WHERE email = $1 AND password = $2 AND active = TRUE',
         [email, passwordHash]
       );

       await client.end();

       const data = queryResult.rows;

        if ((!data ) || (data && data.length === 0)) {
          return null;
        } else {
          const userObj = data[0] as any;
          userObj.userType = 'student';
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
      session.user.token = token;
      session.user.active = token.active as any;
      session.user.address = token.address as any;
      session.user.birth_date = token.birth_date as any;
      session.user.created_at = token.created_at as any;
      session.user.email = token.email as any;
      session.user.enrollment_date = token.enrollment_date as any;
      session.user.id = token.id as any;
      session.user.major = token.major as any;
      session.user.name = token.name as any;
      session.user.phone = token.phone as any;
      session.user.semester = token.semester as any;
      session.user.surname = token.surname as any;
      session.user.speciality = token.speciality as any;
      session.user.admin = token.admin as any;
      session.user.active = token.active as any;
      session.user.advisor = token.advisor as any;
      session.user.number = token.number as any;
      session.user.head_of_deparment_id = token.head_of_deparment_id as any;
      session.user.userType = token.userType as any;
      session.user.graduated = token.graduated as any;
      return session;
    },
  },
  pages: {
    signIn: '../../auth/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

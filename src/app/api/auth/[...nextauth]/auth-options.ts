import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Admin Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        if (credentials.username !== ADMIN_USERNAME) {
          return null;
        }

        if (ADMIN_PASSWORD_HASH) {
          const isValid = await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH);
          if (!isValid) return null;
        } else {
          if (credentials.password !== process.env.ADMIN_PASSWORD) return null;
        }

        return {
          id: '1',
          name: 'Administrator',
          email: 'admin@hupcorner.vercel.app',
          role: 'admin',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

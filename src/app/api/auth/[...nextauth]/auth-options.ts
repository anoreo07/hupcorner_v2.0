import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import GithubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        if (credentials.username !== ADMIN_USERNAME) return null;
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
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Mật khẩu',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const supabase = getSupabaseAdmin();
        const { data: raw } = await (supabase.from('users') as any)
          .select('*')
          .eq('email', credentials.email)
          .single();
        if (!raw) return null;
        const user = raw as {
          status: string; locked_until: string | null; password_hash: string | null;
          id: string; email: string; name: string; role: string; username: string; avatar_url: string | null;
        };
        if (user.status === 'DELETED') return null;
        if (user.status === 'LOCKED' && user.locked_until && new Date(user.locked_until) > new Date()) return null;
        if (!user.password_hash) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          username: user.username,
          avatar_url: user.avatar_url,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider && account.provider !== 'credentials' && account.provider !== 'admin-credentials') {
        const email = user.email;
        if (!email) return false;

        const supabase = getSupabaseAdmin();
        const { data: existingUser } = await (supabase.from('users') as any)
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (!existingUser) {
          // Auto-register user in DB
          let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
          if (!baseUsername) baseUsername = 'user';

          let uniqueUsername = baseUsername;
          let counter = 1;

          while (true) {
            const { data: checkUser } = await (supabase.from('users') as any)
              .select('id')
              .eq('username', uniqueUsername)
              .maybeSingle();

            if (!checkUser) break;
            uniqueUsername = `${baseUsername}${counter}`;
            counter++;
          }

          const { error: insertError } = await (supabase.from('users') as any)
            .insert({
              email,
              name: user.name || uniqueUsername,
              username: uniqueUsername,
              avatar_url: user.image || null,
              role: 'USER',
              status: 'ACTIVE',
            });

          if (insertError) {
            console.error('Failed to auto-register OAuth user in DB:', insertError);
            return false;
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.name = user.name;
        if ((user as any).username) token.username = (user as any).username;
        if ((user as any).avatar_url) token.avatar_url = (user as any).avatar_url;
        token.id = user.id;
      }
      if (account?.provider && account.provider !== 'credentials' && account.provider !== 'admin-credentials') {
        const supabase = getSupabaseAdmin();
        const { data: raw } = await (supabase.from('users') as any)
          .select('*')
          .eq('email', token.email!)
          .single();
        if (raw) {
          const eu = raw as { role: string; username: string; avatar_url: string | null; id: string; name: string };
          token.role = eu.role;
          token.username = eu.username;
          token.avatar_url = eu.avatar_url;
          token.id = eu.id;
          token.name = eu.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).avatar_url = token.avatar_url;
        (session.user as any).id = token.id;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

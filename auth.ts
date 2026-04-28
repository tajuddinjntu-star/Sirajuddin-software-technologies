import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';

const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  session: { strategy: 'database' },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = adminEmails.includes((user.email || '').toLowerCase()) ? 'ADMIN' : user.role;
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.email) return false;
      const role = adminEmails.includes(user.email.toLowerCase()) ? 'ADMIN' : 'CUSTOMER';
      await db.user.update({ where: { email: user.email }, data: { role } }).catch(() => null);
      return true;
    }
  },
  pages: {
    signIn: '/login'
  }
});

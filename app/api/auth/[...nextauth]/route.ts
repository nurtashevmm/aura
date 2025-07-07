// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { authConfig } from '@/auth.config';

export const { 
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig, // Берем базовые настройки
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(credentials.password as string, user.password);
        if (passwordsMatch) return user;
        
        return null;
      },
    }),
  ],
  // Явно прописываем колбэки здесь
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!; // id пользователя
        // @ts-ignore
        session.user.role = token.role; // роль пользователя
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    // Этот колбэк нужен для middleware
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdminPanel = nextUrl.pathname.startsWith('/admin');

      if (isOnDashboard || isOnAdminPanel) {
        if (isLoggedIn) return true;
        return false; // Редирект на страницу входа
      } else if (isLoggedIn) {
        // Если залогинен и на странице входа/регистрации, редирект на дашборд
        if (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
  },
});
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = [
  { path: '/admin', role: 'ADMIN' },
  { path: '/merchant', role: 'MERCHANT' },
  { path: '/dashboard', role: 'PLAYER' },
];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.path)) {
      if (!token || token.role !== route.role) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/merchant/:path*', '/dashboard/:path*'],
};

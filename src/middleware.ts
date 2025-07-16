import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require specific roles
const roleProtected: Record<string, string[]> = {
  ADMIN: ['/admin'],
  MERCHANT: ['/merchant'],
  PLAYER: ['/dashboard'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Skip _next static and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    // Not authenticated — redirect to signin, keep original path for callback
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
  }
  // role-based check
  for (const [role, paths] of Object.entries(roleProtected)) {
    if (paths.some(p => pathname.startsWith(p))) {
      if (token.role !== role) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/merchant/:path*', '/dashboard/:path*'],
};

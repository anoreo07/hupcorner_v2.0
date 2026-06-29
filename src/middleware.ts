import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      return NextResponse.next();
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};

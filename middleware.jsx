import { NextResponse } from "next/server";
import { stackServerApp } from "./stack";

export async function middleware(request) {
  // Allow all handler routes (auth routes)
  if (request.nextUrl.pathname.startsWith('/handler')) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      // Redirect to sign-in if not authenticated
      return NextResponse.redirect(new URL('/handler/sign-in', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/handler/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    // Add other protected routes here
  ]
};
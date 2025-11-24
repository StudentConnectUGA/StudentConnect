// middleware.ts
import  auth  from "next-auth"; // NextAuth v5 helper

export default auth((req) => {
  const { nextUrl, auth } = req;

  // If the user is NOT logged in
  if (!auth?.user) {
    // Public routes allowed
    const publicRoutes = [
      "/",                         // homepage
      "/api/auth",                 // nextauth actions
      "/api/auth/",                // nextauth variations
      "/api/auth/signin",
      "/api/auth/callback/google",
    ];

    // Allow public routes to pass
    if (publicRoutes.some((p) => nextUrl.pathname.startsWith(p))) {
      return;
    }

    // Redirect unauthenticated users to sign-in
    const signInUrl = new URL("/api/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(signInUrl);
  }

  // If authenticated, allow request
  return;
});

// Define which routes this middleware applies to
export const config = {
  matcher: [
    "/dashboard/:path*",       // user dashboard
    "/settings/:path*",        // user settings
    "/api/user/:path*",        // protected API endpoints
    "/api/tutors/:path*",      // optional - you can protect or keep public
    "/courses/:path*",         // protected pages
  ],
};

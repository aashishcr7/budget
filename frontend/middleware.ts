// import { NextRequest, NextResponse } from "next/server";

// const protectedRoutes = ["/dashboard", "/create-trip", "/profile", "/trips"];

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("access_token");
//   const pathname = request.nextUrl.pathname;

//   console.log("PATH:", request.nextUrl.pathname);
//   console.log("TOKEN:", token?.value);

//   const isProtected = protectedRoutes.some((route) =>
//     pathname.startsWith(route),
//   );

//   if (isProtected && !token) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/create-trip/:path*",
//     "/profile/:path*",
//     "/trips/:path*",
//   ],
// };

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token");

  console.log("PATH:", request.nextUrl.pathname);
  console.log("TOKEN:", token?.value);
  console.log(
    "ALL COOKIES:",
    request.cookies.getAll().map((c) => c.name),
  );

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create-trip/:path*",
    "/profile/:path*",
    "/trips/:path*",
  ],
};

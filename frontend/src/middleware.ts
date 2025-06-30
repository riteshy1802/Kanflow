import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const access_token = request.cookies.get("access_token")?.value ?? null;

  const publicPaths = [
    "/login",
    "/register",
  ];

  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(publicPath + "/")
  );

  if (!isPublicPath && !access_token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && access_token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

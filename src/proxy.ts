import { auth } from "@/lib/auth";

// En Next.js 16 con NextAuth v5, se exporta auth directamente como proxy
export const proxy = auth;

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

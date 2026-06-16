import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (
          username === process.env.ADMIN_USERNAME &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Carmen", email: "carmen@clinicacarmen.com" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const publicPaths = ["/", "/api/reservar"];
      const isPublic = publicPaths.some(
        (p) => nextUrl.pathname === p || nextUrl.pathname.startsWith(p + "/")
      );
      if (isPublic) return true;
      return !!auth?.user;
    },
  },
});

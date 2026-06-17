import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "admin",
      name: "admin",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
          return { id: "admin", name: "Carmen", email: "carmen@clinicacarmen.com" };
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
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;

      // Rutas públicas: landing, reservas, pilates, ficha médica
      const publicPrefixes = [
        "/", "/api/reservar", "/clases", "/pedir-cita",
        "/mi-cuenta", "/mi-ficha", "/acceso",
        "/api/clases", "/api/mi-cuenta",
        "/api/auth/paciente",
      ];
      const isPublic = publicPrefixes.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );
      if (isPublic) return true;

      // El resto requiere sesión admin
      return !!auth?.user;
    },
  },
});

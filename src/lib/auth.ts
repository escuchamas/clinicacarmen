import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getPacienteByEmailWithPassword } from "./db";

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
          return { id: "admin", name: "Carmen", email: "carmen@clinicacarmen.com", role: "admin" };
        }
        return null;
      },
    }),
    Credentials({
      id: "patient",
      name: "patient",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;
        const paciente = await getPacienteByEmailWithPassword(email);
        if (!paciente) return null;
        const valid = await bcrypt.compare(password, paciente.passwordHash);
        if (!valid) return null;
        return { id: paciente.id, name: paciente.nombre, email: paciente.email, role: "patient", pacienteId: paciente.id };
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
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
        token.pacienteId = (user as { pacienteId?: string }).pacienteId;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as { role?: string; pacienteId?: string }).role = token.role as string;
      (session.user as { role?: string; pacienteId?: string }).pacienteId = token.pacienteId as string | undefined;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      const publicPaths = ["/", "/api/reservar", "/clases", "/acceso", "/api/auth/paciente", "/pedir-cita"];
      const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
      if (isPublic) return true;

      const user = auth?.user as { role?: string } | undefined;
      if (!user) return false;

      // Patient portal — any authenticated user
      if (pathname.startsWith("/mi-cuenta")) return true;

      // API routes for patient portal
      if (pathname.match(/^\/api\/clases\/[^/]+\/inscribirse/)) return true;
      if (pathname.startsWith("/api/mi-cuenta")) return true;

      // Admin-only: block patients from dashboard
      if (user.role === "patient") return false;

      return true;
    },
  },
});

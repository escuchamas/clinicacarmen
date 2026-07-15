"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("admin", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Usuario o contraseña incorrectos");
    } else {
      router.push("/pacientes");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F5EFE9" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / Cabecera */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-white text-2xl font-bold"
            style={{ backgroundColor: "#9B7B68" }}
          >
            V
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#1a1a1a" }}
          >
            ViaNova
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Fisioterapia · Campillos
          </p>
        </div>

        {/* Tarjeta de login */}
        <div className="card p-8">
          <h2 className="text-lg font-semibold mb-6" style={{ color: "#1a1a1a" }}>
            Acceder al sistema
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu usuario"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p
                className="text-sm p-3 rounded-lg"
                style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center mt-2"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#9ca3af" }}>
          Sistema privado · Solo uso autorizado
        </p>
      </div>
    </div>
  );
}

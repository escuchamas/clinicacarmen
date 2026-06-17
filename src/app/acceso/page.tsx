"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const AQUA = "#0891B2";
const AQUA_DARK = "#0E7490";
const CREAM = "#F2EDE3";
const DARK = "#111827";

export default function AccesoPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ nombre: "", email: "", password: "", confirm: "" });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("patient", { email: loginForm.email, password: loginForm.password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Email o contraseña incorrectos."); return; }
    router.push("/mi-cuenta");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (registerForm.password !== registerForm.confirm) { setError("Las contraseñas no coinciden."); return; }
    if (registerForm.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/paciente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", nombre: registerForm.nombre, email: registerForm.email, password: registerForm.password }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); setError(data.error ?? "Error al registrarse."); return; }

    // Auto-login after register
    await signIn("patient", { email: registerForm.email, password: registerForm.password, redirect: false });
    setLoading(false);
    router.push("/mi-cuenta");
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: DARK, minHeight: "100vh", backgroundColor: CREAM, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "0 1.5rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: AQUA, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>M</div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: DARK }}>Millennialfisio</span>
          </Link>
          <Link href="/clases" style={{ color: AQUA, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>Ver clases de pilates</Link>
        </div>
      </header>

      {/* Formulario centrado */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              {tab === "login" ? "Bienvenida de nuevo" : "Crear cuenta"}
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>
              {tab === "login" ? "Accede para gestionar tus clases" : "Regístrate para reservar clases de pilates"}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderRadius: "0.75rem", backgroundColor: "#f3f4f6", padding: "0.25rem", marginBottom: "1.5rem" }}>
            {(["login", "register"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "0.625rem", borderRadius: "0.5rem", border: "none", cursor: "pointer",
                  backgroundColor: tab === t ? "white" : "transparent",
                  color: tab === t ? DARK : "#6b7280",
                  fontWeight: tab === t ? 700 : 500,
                  fontSize: "0.875rem",
                  boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {t === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            {tab === "login" ? (
              <form onSubmit={handleLogin} style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" required placeholder="tu@email.com" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Contraseña</label>
                  <div style={{ position: "relative" }}>
                    <input style={{ ...inputStyle, paddingRight: "3rem" }} type={showPass ? "text" : "password"} required placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "0.5rem" }}>{error}</p>}
                <button type="submit" disabled={loading} style={btnStyle(loading)}>
                  {loading ? "Entrando..." : "Iniciar sesión →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input style={inputStyle} required placeholder="Tu nombre" value={registerForm.nombre} onChange={e => setRegisterForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" required placeholder="tu@email.com" value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Contraseña *</label>
                  <div style={{ position: "relative" }}>
                    <input style={{ ...inputStyle, paddingRight: "3rem" }} type={showPass ? "text" : "password"} required minLength={6} placeholder="Mínimo 6 caracteres" value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Repetir contraseña *</label>
                  <input style={inputStyle} type={showPass ? "text" : "password"} required placeholder="Repite la contraseña" value={registerForm.confirm} onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  Si Carmen ya tiene tu email en su sistema, tu cuenta se vinculará automáticamente.
                </p>
                {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "0.5rem" }}>{error}</p>}
                {success && <p style={{ color: "#10b981", fontSize: "0.875rem", backgroundColor: "#f0fdf4", padding: "0.75rem", borderRadius: "0.5rem" }}>{success}</p>}
                <button type="submit" disabled={loading} style={btnStyle(loading)}>
                  {loading ? "Creando cuenta..." : "Crear cuenta →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem", border: "1.5px solid #DDD8CE", borderRadius: "0.5rem",
  fontSize: "0.9375rem", outline: "none", backgroundColor: "white", boxSizing: "border-box",
};
const btnStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%", padding: "1rem", backgroundColor: disabled ? "#9ca3af" : "#0891B2",
  color: "white", fontWeight: 700, fontSize: "1rem", border: "none", borderRadius: "0.625rem",
  cursor: disabled ? "not-allowed" : "pointer",
});

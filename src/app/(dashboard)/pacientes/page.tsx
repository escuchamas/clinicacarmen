"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Paciente } from "@/lib/types";

export default function DashboardPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchPacientes = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/pacientes${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacientes("");
  }, [fetchPacientes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPacientes(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchPacientes]);

  function getInitials(nombre: string, apellidos: string) {
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  return (
    <div>
      {/* Cabecera de página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>
            Pacientes
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
            {loading ? "Cargando..." : `${pacientes.length} paciente${pacientes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/pacientes/nuevo"
          className="btn-primary"
          style={{ textDecoration: "none" }}
        >
          <span>+</span>
          <span>Nuevo paciente</span>
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Buscar por DNI, nombre o email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <div
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#0891B2", borderTopColor: "transparent" }}
            />
          </div>
        )}
      </div>

      {/* Lista de pacientes */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#0891B2", borderTopColor: "transparent" }}
          />
        </div>
      ) : pacientes.length === 0 ? (
        <div className="card p-12 text-center">
          {query ? (
            <>
              <p className="text-lg font-medium mb-1" style={{ color: "#1a1a1a" }}>
                Sin resultados
              </p>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                No hay pacientes que coincidan con &quot;{query}&quot;
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium mb-1" style={{ color: "#1a1a1a" }}>
                Aún no hay pacientes
              </p>
              <p className="text-sm mb-4" style={{ color: "#6b7280" }}>
                Registra tu primer paciente para empezar
              </p>
              <Link href="/pacientes/nuevo" className="btn-primary" style={{ textDecoration: "none" }}>
                + Nuevo paciente
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {pacientes.map((p) => (
            <Link
              key={p.id}
              href={`/pacientes/${p.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card px-4 py-3.5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderColor: "#DDD8CE" }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: "#0891B2" }}
                >
                  {getInitials(p.nombre, p.apellidos)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "#1a1a1a" }}>
                    {p.nombre} {p.apellidos}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#6b7280" }}>
                    DNI: {p.dni} · {p.email}
                  </p>
                </div>

                {/* Fecha alta */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    Alta
                  </p>
                  <p className="text-xs font-medium" style={{ color: "#6b7280" }}>
                    {formatDate(p.fechaAlta)}
                  </p>
                </div>

                {/* Flecha */}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

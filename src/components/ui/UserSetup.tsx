"use client";
import { useState, useEffect, useRef } from "react";
import { supabase, getCountries } from "@/lib/supabase";
import type { CountryRow } from "@/lib/supabase";

interface Props {
  onDone: (username: string, countryCode: string) => void;
}

const RESERVED = ["admin", "agroverse", "test", "root"];

export default function UserSetup({ onDone }: Props) {
  const [username, setUsername]       = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [countries, setCountries]     = useState<CountryRow[]>([]);
  const [error, setError]             = useState("");
  const [checking, setChecking]       = useState(false);
  const [available, setAvailable]     = useState<boolean | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { getCountries().then(setCountries); }, []);

  const selectedCountry = countries.find((c) => c.code === countryCode);

  useEffect(() => {
    const u = username.trim();
    setAvailable(null);
    setError("");
    if (u.length < 3 || !/^[a-zA-Z0-9_]+$/.test(u)) return;
    if (RESERVED.includes(u.toLowerCase())) { setAvailable(false); setError("Nombre reservado"); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setChecking(true);
      try {
        const { data } = await supabase
          .from("players")
          .select("username")
          .eq("username", u)
          .maybeSingle();
        setAvailable(!data);
        if (data) setError("❌ Ese nombre ya está en uso");
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);
  }, [username]);

  const validate = async () => {
    const u = username.trim();
    if (u.length < 3) { setError("Mínimo 3 caracteres"); return; }
    if (u.length > 20) { setError("Máximo 20 caracteres"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) { setError("Solo letras, números y _"); return; }
    if (!countryCode) { setError("Selecciona tu país"); return; }
    if (available === false) { setError("Ese nombre ya está en uso"); return; }
    setSubmitting(true);
    onDone(u, countryCode);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
         style={{ background: "linear-gradient(180deg, #87ceeb 0%, #e8f5e9 40%, #fff8e1 100%)" }}>

      <img src="/assets/logo.png" alt="AgroVerse" className="w-20 h-20 mb-4 animate-float" />
      <h1 className="text-2xl font-bold text-green-800 mb-1">Crea tu perfil</h1>
      <p className="text-green-600 text-sm mb-8 text-center max-w-xs">
        Elige tu nombre de agricultor y tu país. Así aparecerás en el ranking global.
      </p>

      <div className="w-full max-w-xs flex flex-col gap-4">

        <div>
          <label className="text-green-800 text-sm font-semibold mb-1.5 block">
            👤 Nombre de agricultor
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej. CafeteroGlobal"
              maxLength={20}
              className={`w-full border-2 rounded-xl px-4 py-3 text-green-900 font-semibold outline-none transition bg-white pr-10 ${
                available === true ? "border-green-500" :
                available === false ? "border-red-400" :
                "border-green-300 focus:border-green-500"
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
              {checking ? "⏳" : available === true ? "✅" : available === false ? "❌" : ""}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1 ml-1">{username.trim().length}/20 · Solo letras, números y _</p>
        </div>

        <div>
          <label className="text-green-800 text-sm font-semibold mb-1.5 block">
            🌍 Tu país
          </label>
          {countries.length === 0 ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-green-600 text-sm">Cargando países...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCountryCode(c.code); setError(""); }}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 text-center transition active:scale-95 ${
                    countryCode === c.code
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-300"
                  }`}
                >
                  {c.code === "OTHER"
                    ? <span className="text-2xl">🌍</span>
                    : <img src={c.flag_url} alt={c.name} className="w-8 h-5 object-cover rounded-sm" />
                  }
                  <span className="text-xs text-gray-600 mt-0.5 leading-tight">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {username.trim().length >= 3 && selectedCountry && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 flex items-center gap-3">
            {selectedCountry.code === "OTHER"
              ? <span className="text-3xl">🌍</span>
              : <img src={selectedCountry.flag_url} alt={selectedCountry.name} className="w-10 h-7 object-cover rounded" />
            }
            <div>
              <p className="text-green-800 font-bold">{username.trim()}</p>
              <p className="text-green-600 text-xs">{selectedCountry.name} · Nivel 1</p>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

        <button
          onClick={validate}
          className="w-full bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg transition active:scale-95 disabled:opacity-40"
          disabled={!username.trim() || !countryCode || checking || available === false || submitting}
        >
          {submitting ? "Guardando..." : "🌱 Empezar a cultivar"}
        </button>
      </div>
    </div>
  );
}

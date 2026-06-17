"use client";
import { useEffect, useState } from "react";
import { usePrizePool } from "@/hooks/useContract";
import { getTopPlayers } from "@/lib/supabase";
import type { PlayerRow } from "@/lib/supabase";

const flagUrl = (code: string) =>
  code === "OTHER" ? null : `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

const MEDAL = ["🥇", "🥈", "🥉"];

// Distribución del premio: Top 3
const DISTRIBUTION = [
  { pos: 1, label: "1er lugar", pct: 50, medal: "🥇" },
  { pos: 2, label: "2do lugar", pct: 30, medal: "🥈" },
  { pos: 3, label: "3er lugar", pct: 20, medal: "🥉" },
];

// Zona horaria por código de país
const COUNTRY_TZ: Record<string, string> = {
  CO: "America/Bogota",
  MX: "America/Mexico_City",
  AR: "America/Argentina/Buenos_Aires",
  CL: "America/Santiago",
  PE: "America/Lima",
  EC: "America/Guayaquil",
  BO: "America/La_Paz",
  VE: "America/Caracas",
  PY: "America/Asuncion",
  UY: "America/Montevideo",
  BR: "America/Sao_Paulo",
  PA: "America/Panama",
  CR: "America/Costa_Rica",
  GT: "America/Guatemala",
  HN: "America/Tegucigalpa",
  SV: "America/El_Salvador",
  NI: "America/Managua",
  DO: "America/Santo_Domingo",
  CU: "America/Havana",
  US: "America/New_York",
  CA: "America/Toronto",
  ES: "Europe/Madrid",
  PT: "Europe/Lisbon",
  FR: "Europe/Paris",
  DE: "Europe/Berlin",
  IT: "Europe/Rome",
  GB: "Europe/London",
  NG: "Africa/Lagos",
  GH: "Africa/Accra",
  KE: "Africa/Nairobi",
  IN: "Asia/Kolkata",
  PH: "Asia/Manila",
  ID: "Asia/Jakarta",
  JP: "Asia/Tokyo",
  OTHER: "America/Bogota",
};

// Liquidación: último día del mes a las 23:59 hora Colombia (UTC-5)
function getLiquidationInTz(countryCode: string) {
  const tz = COUNTRY_TZ[countryCode] ?? "America/Bogota";
  const now = new Date();
  // Último día del mes actual
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const dateStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}T23:59:00`;

  // Hora en Colombia
  const coTime = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit", month: "long", year: "numeric",
  }).format(lastDay);

  // Hora en la zona del usuario
  const userTime = new Intl.DateTimeFormat("es", {
    timeZone: tz,
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: true,
  }).format(new Date(`${dateStr}-05:00`)); // Colombia = UTC-5

  const isSameTz = tz === "America/Bogota";

  return { coTime, userTime, isSameTz, lastDay };
}

interface Props {
  currentAddress?: string | null;
  currentPoints?: number;
  username?: string;
  countryFlagUrl?: string | null;
  countryCode?: string;
}

export default function Ranking({ currentAddress, currentPoints, username, countryFlagUrl, countryCode = "CO" }: Props) {
  const prizePool = usePrizePool();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getTopPlayers(20).then((data) => {
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  const myPosition = players.findIndex((p) => p.wallet_address === currentAddress) + 1;
  const liq = getLiquidationInTz(countryCode);

  // Progreso de nivel (igual que en Profile)
  const myPlayer = players.find((p) => p.wallet_address === currentAddress);
  const myLevel  = myPlayer?.level ?? Math.floor((currentPoints ?? 0) / 500) + 1;
  const levelBase = (myLevel - 1) * 500;
  const levelNext = myLevel * 500;
  const levelProgress = Math.min(100, Math.max(0, (((currentPoints ?? 0) - levelBase) / (levelNext - levelBase)) * 100));
  const pool = prizePool ? parseFloat(prizePool) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-green-800">🏆 Ranking Global</h2>
        <p className="text-green-600 text-xs mt-1">Top agricultores del mundo · Season 1</p>
      </div>

      {/* Premio */}
      <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-3 text-center">
        <p className="text-amber-800 text-sm font-bold">🎁 Premio total del mes</p>
        <p className="text-amber-600 font-mono font-black text-xl mt-1">
          {prizePool !== null ? `${prizePool} USDC` : "Cargando..."}
        </p>
        <p className="text-amber-700 text-xs mt-1">
          Top 3 recibe <strong>USDC real</strong> directo a su wallet
        </p>
        <p className="text-amber-500 text-xs mt-0.5">Liquidación: 30 Jun 2026</p>
        <button
          onClick={() => setShowModal(true)}
          className="mt-2 text-amber-600 text-xs underline underline-offset-2 font-semibold"
        >
          Ver distribución del premio →
        </button>
      </div>

      {/* Tu posición */}
      {currentAddress && myPosition > 0 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-3">
          <p className="text-green-600 text-xs mb-1 font-medium">Tu posición</p>
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-bold flex items-center gap-1">
              #{myPosition} ·{" "}
              {countryFlagUrl
                ? <img src={countryFlagUrl} alt="" className="w-4 h-3 object-cover rounded-sm inline" />
                : "🌍"}
              {username ?? "Tú"}
            </span>
            <span className="text-amber-600 font-mono font-bold">{currentPoints ?? 0} pts</span>
          </div>
          <div className="mt-2 bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${levelProgress}%` }} />
          </div>
          <p className="text-green-500 text-xs mt-1">Nivel {myLevel} · faltan {Math.max(0, levelNext - (currentPoints ?? 0))} puntos para Nivel {myLevel + 1}</p>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-green-600 text-sm">Cargando ranking...</p>
          </div>
        )}
        {!loading && players.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Aún no hay jugadores. ¡Sé el primero!</p>
        )}
        {!loading && players.map((p, i) => {
          const flag = flagUrl(p.country_code);
          const isMe = p.wallet_address === currentAddress;
          return (
            <div key={p.wallet_address}
              className={`flex items-center gap-3 rounded-xl p-3 border transition ${
                isMe ? "bg-green-50 border-green-400" :
                i < 3 ? "bg-amber-50 border-amber-300" : "bg-white border-gray-200"
              }`}>
              <span className="text-xl w-8 text-center">
                {MEDAL[i] ?? `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-green-900 font-semibold text-sm truncate flex items-center gap-1">
                  {flag ? <img src={flag} alt="" className="w-4 h-3 object-cover rounded-sm inline" /> : "🌍"}
                  {p.username} {isMe && <span className="text-green-500 text-xs">· tú</span>}
                </p>
                <p className="text-green-500 text-xs">Nivel {p.level}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-600 font-bold font-mono">{p.points.toLocaleString()}</p>
                <p className="text-gray-400 text-xs">pts</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal distribución */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 pb-10 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-green-800 font-bold text-lg text-center">🎁 Distribución del premio</p>
            <p className="text-gray-500 text-xs text-center mt-1 mb-5">
              Premio total del mes · Season 1
            </p>

            {/* Barras de distribución */}
            <div className="flex flex-col gap-3 mb-6">
              {DISTRIBUTION.map((d) => {
                const amount = pool !== null ? ((pool * d.pct) / 100).toFixed(2) : null;
                return (
                  <div key={d.pos} className="flex items-center gap-3">
                    <span className="text-2xl w-8 text-center shrink-0">{d.medal}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-green-800 text-sm font-semibold">{d.label}</span>
                        <span className="text-amber-600 font-mono font-bold text-sm">
                          {amount !== null ? `${amount} USDC` : `${d.pct}%`}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{d.pct}% del pozo</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Próxima liquidación */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-amber-800 font-semibold text-sm mb-2">⏰ Próxima liquidación</p>
              <p className="text-amber-700 text-sm font-semibold">
                {liq.coTime} · 11:59 PM
              </p>
              <p className="text-amber-600 text-xs mt-0.5">Hora oficial: Colombia (UTC-5)</p>
              {!liq.isSameTz && (
                <p className="text-amber-500 text-xs mt-2">
                  En tu país esto equivale a: <span className="font-semibold">{liq.userTime}</span>
                </p>
              )}
              <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                El premio se reparte automáticamente al finalizar el mes. Asegúrate de estar en el Top 3 antes de esa fecha.
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full bg-green-600 text-white font-bold py-3 rounded-2xl active:scale-95 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

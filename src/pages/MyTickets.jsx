import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { listarIngressos } from "../services/ticketService";

const STATUS_STYLE = {
  EMITIDO: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  UTILIZADO: "bg-white/10 text-white/40 border border-white/10",
  CANCELADO: "bg-red-500/15 text-red-400 border border-red-500/20",
};

const STATUS_ACCENT = {
  EMITIDO: "before:bg-emerald-500/60",
  UTILIZADO: "before:bg-white/15",
  CANCELADO: "before:bg-red-500/60",
};

export default function MyTickets() {
  const navigate = useNavigate();

  const [ingressos, setIngressos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    listarIngressos()
      .then(setIngressos)
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisivel(true), 20);
      return () => clearTimeout(t);
    }
  }, [loading]);

  function copiarLink(ingresso) {
    const link = `${window.location.origin}/ingressos/compartilhado/${ingresso.shareToken}`;
    navigator.clipboard.writeText(link);
    setCopiadoId(ingresso.id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  return (
    <div className="relative min-h-screen bg-bg px-6 md:px-16 py-12 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 right-0 w-[560px] h-[560px] rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="relative z-10">
        <div
          className={`transition-all duration-500 ease-out ${
            visivel || loading ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
        
          <h1 className="font-display text-4xl md:text-6xl text-white tracking-wide mt-10">
            MEUS <span className="text-brand">INGRESSOS</span>
          </h1>
          <div className="h-px w-full max-w-[10rem] bg-gradient-to-r from-brand/60 to-transparent mt-5" />
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-surface border border-white/10 rounded-2xl p-6 flex flex-col items-center"
              >
                <div className="self-start h-4 w-16 rounded-md bg-white/5 animate-pulse" />
                <div className="h-6 w-2/3 rounded-md bg-white/5 animate-pulse mt-4" />
                <div className="h-3 w-1/3 rounded-md bg-white/5 animate-pulse mt-3 mb-6" />
                <div className="w-[140px] h-[140px] rounded-lg bg-white/5 animate-pulse" />
                <div className="h-3 w-1/2 rounded-md bg-white/5 animate-pulse mt-6" />
              </div>
            ))}
          </div>
        )}

        {erro && !loading && (
          <div className="mt-10 bg-[#2a0e16]/60 border border-red-500/20 rounded-2xl p-6 max-w-md">
            <p className="font-sans text-red-400 text-sm">{erro}</p>
          </div>
        )}

        {!loading && !erro && ingressos.length === 0 && (
          <div
            className={`mt-10 bg-surface border border-white/10 rounded-2xl px-8 py-16 flex flex-col items-center text-center max-w-lg transition-all duration-500 ease-out ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-[#a11b3e]/15 border border-[#a11b3e]/40 flex items-center justify-center mb-5">
              <span className="text-2xl">🎟️</span>
            </div>
            <h3 className="font-display text-2xl text-white tracking-wide">
              Nenhum ingresso por aqui
            </h3>
            <p className="font-sans text-white/50 text-sm mt-2 mb-7">
              Você ainda não tem ingressos. Que tal escolher um evento?
            </p>
            <button
              onClick={() => navigate("/")}
              className="font-sans font-semibold text-xs uppercase tracking-wider bg-[#a11b3e] hover:bg-[#c22448] text-white rounded-full px-6 py-3 transition-colors duration-300"
            >
              Explorar Eventos
            </button>
          </div>
        )}

        {!loading && !erro && ingressos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {ingressos.map((ingresso, index) => (
              <div
                key={ingresso.id}
                style={{ transitionDelay: visivel ? `${Math.min(index, 8) * 45}ms` : "0ms" }}
                className={`group relative before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:rounded-t-2xl ${
                  STATUS_ACCENT[ingresso.status] || "before:bg-white/15"
                } bg-surface border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center
                transition-all duration-500 ease-out hover:-translate-y-1 hover:border-white/20
                hover:shadow-[0_12px_32px_-8px_rgba(161,27,62,0.35)]
                ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              >
                <span
                  className={`self-start font-sans text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    STATUS_STYLE[ingresso.status] || "bg-white/10 text-white/50 border border-white/10"
                  }`}
                >
                  {ingresso.status}
                </span>

                <h3 className="font-display text-2xl tracking-wide text-white mt-4 leading-snug">
                  {ingresso.eventoTitulo}
                </h3>
                <p className="font-sans text-white/40 text-xs uppercase tracking-wider mt-1 mb-5">
                  Assento {ingresso.assentoCodigo}
                </p>

                <div className="bg-white p-3 rounded-lg transition-transform duration-300 group-hover:scale-[1.02]">
                  <QRCodeSVG value={ingresso.codigoValidacao} size={140} />
                </div>

                <div className="w-full h-px bg-white/10 mt-6 mb-4" />

                <button
                  onClick={() => copiarLink(ingresso)}
                  className="font-sans text-xs text-brand hover:text-brand-hover transition-colors duration-300 underline underline-offset-4 decoration-brand/40"
                >
                  {copiadoId === ingresso.id ? "Link copiado ✓" : "Copiar link de compartilhamento"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
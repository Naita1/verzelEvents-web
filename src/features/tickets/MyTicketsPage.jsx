import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { listarIngressos } from "./api";

const STATUS_STYLE = {
  EMITIDO: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UTILIZADO: "bg-white/10 text-white/40 border-white/15",
  CANCELADO: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_ACCENT = {
  EMITIDO: "before:bg-emerald-500",
  UTILIZADO: "before:bg-white/20",
  CANCELADO: "before:bg-red-500",
};

export default function MyTicketsPage() {
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
    <div className="relative min-h-screen bg-bg px-6 md:px-12 lg:px-16 py-12 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 right-0 w-140 h-140 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-1/2 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="relative z-10">
        <div
          className={`transition-all duration-500 ease-out ${
            visivel || loading ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 mb-3 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="font-sans text-[11px] font-bold text-brand uppercase tracking-[0.2em]">
              Carteira Digital
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl text-white tracking-wide">
            MEUS <span className="text-brand">INGRESSOS</span>
          </h1>
          <p className="font-sans text-xs md:text-sm text-white/50 mt-2 max-w-md">
            Gerencie seus passes de acesso, visualize o QR Code para entrada e compartilhe com acompanhantes.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#140509]/80 border border-white/10 rounded-3xl p-6 flex flex-col items-center animate-pulse"
              >
                <div className="self-start h-5 w-20 rounded-full bg-white/10" />
                <div className="h-7 w-3/4 rounded-lg bg-white/10 mt-5" />
                <div className="h-4 w-1/3 rounded-full bg-white/10 mt-3 mb-6" />
                <div className="w-40 h-40 rounded-2xl bg-white/10" />
                <div className="h-4 w-1/2 rounded-full bg-white/10 mt-6" />
              </div>
            ))}
          </div>
        )}

        {erro && !loading && (
          <div className="mt-10 bg-[#1a060b]/90 border border-red-500/30 rounded-3xl p-6 max-w-md flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="font-sans font-semibold text-white text-sm">Não foi possível carregar os ingressos</p>
              <p className="font-sans text-white/60 text-xs mt-0.5">{erro}</p>
            </div>
          </div>
        )}

        {!loading && !erro && ingressos.length === 0 && (
          <div
            className={`mt-10 bg-[#140509]/80 backdrop-blur-2xl border border-white/10 rounded-3xl px-8 py-16 flex flex-col items-center text-center max-w-lg mx-auto shadow-2xl transition-all duration-500 ease-out ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mb-5 shadow-inner">
              <svg className="w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2" />
                <path d="M13 17v2" />
                <path d="M13 11v2" />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white tracking-wide">
              Nenhum ingresso por aqui
            </h3>
            <p className="font-sans text-white/55 text-sm mt-2 mb-8 max-w-xs leading-relaxed">
              Você ainda não garantiu ingressos para as próximas atrações. Descubra novas experiências em cartaz!
            </p>
            <button
              onClick={() => navigate("/")}
              className="group font-sans font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand hover:brightness-110 text-white rounded-full px-8 py-3.5 flex items-center gap-2.5 transition-all duration-300 active:scale-95 shadow-lg shadow-brand/30 hover:shadow-brand/50"
            >
              <span>Explorar Eventos</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}

        {!loading && !erro && ingressos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {ingressos.map((ingresso, index) => (
              <div
                key={ingresso.id}
                style={{ transitionDelay: visivel ? `${Math.min(index, 8) * 45}ms` : "0ms" }}
                className={`group relative before:absolute before:inset-x-0 before:top-0 before:h-0.75 before:rounded-t-3xl ${
                  STATUS_ACCENT[ingresso.status] || "before:bg-white/15"
                } bg-[#140509]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 flex flex-col items-center text-center
                transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand/40
                hover:shadow-2xl hover:shadow-brand/15
                ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              >
                <span
                  className={`self-start font-sans text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-xs ${
                    STATUS_STYLE[ingresso.status] || "bg-white/10 text-white/50 border-white/15"
                  }`}
                >
                  {ingresso.status}
                </span>

                <h3 className="font-display text-2xl tracking-wide text-white mt-3.5 leading-snug line-clamp-2">
                  {ingresso.eventoTitulo}
                </h3>
                <div className="inline-flex items-center gap-1.5 mt-2 mb-4 px-3 py-0.5 rounded-full bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Assento</span>
                  <span className="text-xs font-bold text-brand">{ingresso.assentoCodigo}</span>
                </div>

                <div className="w-full flex items-center gap-2 my-1 select-none" aria-hidden="true">
                  <div className="h-px flex-1 border-t border-dashed border-white/15" />
                  <span className="text-[9px] uppercase font-mono tracking-widest text-white/30">
                    VALIDAÇÃO
                  </span>
                  <div className="h-px flex-1 border-t border-dashed border-white/15" />
                </div>

                <div className="my-4 p-3 bg-white rounded-2xl shadow-xl border-2 border-white/90 transition-transform duration-300 group-hover:scale-[1.03]">
                  <QRCodeSVG
                    value={ingresso.codigoValidacao}
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {ingresso.codigoValidacao && (
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-white/40 mb-4 select-all">
                    {ingresso.codigoValidacao}
                  </span>
                )}

                <div className="w-full h-px bg-white/10 mt-auto mb-4" />

                <button
                  type="button"
                  onClick={() => copiarLink(ingresso)}
                  className={`w-full py-2.5 px-4 rounded-xl font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 border cursor-pointer ${
                    copiadoId === ingresso.id
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-white/5 hover:bg-brand/20 border-white/10 hover:border-brand/40 text-white/80 hover:text-white"
                  }`}
                >
                  {copiadoId === ingresso.id ? (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Link copiado!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-white/40 group-hover:text-brand transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      <span>Compartilhar Ingresso</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
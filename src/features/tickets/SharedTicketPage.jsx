import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buscarIngressoPorToken } from "./api";

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

export default function SharedTicketPage() {
  const { token } = useParams();
  const [ingresso, setIngresso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    buscarIngressoPorToken(token)
      .then(setIngresso)
      .catch(() => setErro("Ingresso não encontrado ou link inválido."))
      .finally(() => setLoading(false));
  }, [token]);

  function copiarCodigoValidacao() {
    if (!ingresso?.codigoValidacao) return;
    navigator.clipboard.writeText(ingresso.codigoValidacao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-bg flex items-center justify-center px-4 py-12 overflow-hidden font-sans">
        <div
          className="pointer-events-none absolute -top-40 right-0 w-125 h-125 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div className="w-full max-w-sm bg-[#140509]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center animate-pulse">
          <div className="h-4 w-28 bg-white/10 rounded-full mb-6" />
          <div className="h-6 w-20 bg-white/10 rounded-full self-start mb-4" />
          <div className="h-8 w-3/4 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-1/3 bg-white/10 rounded-full mb-8" />
          <div className="w-44 h-44 rounded-2xl bg-white/10 mb-6" />
          <div className="h-4 w-1/2 bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  if (erro || !ingresso) {
    return (
      <div className="relative min-h-screen bg-bg flex items-center justify-center px-4 py-12 font-sans overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 right-0 w-125 h-125 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div className="w-full max-w-md bg-[#140509]/90 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-5 text-red-400">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-white tracking-wide mb-2">
            Ingresso Indisponível
          </h2>
          <p className="font-sans text-sm text-white/60 mb-6 leading-relaxed">
            {erro || "O link fornecido é inválido, expirou ou o ingresso não foi encontrado."}
          </p>
          <Link
            to="/"
            className="font-sans text-xs uppercase font-bold tracking-wider px-6 py-3 rounded-full bg-linear-to-r from-brand via-[#bd224b] to-brand text-white hover:brightness-110 transition-all shadow-lg shadow-brand/30"
          >
            Explorar Eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 right-0 w-140 h-140 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="font-sans text-[11px] font-bold text-white/70 uppercase tracking-[0.2em]">
            Ingresso Digital Compartilhado
          </span>
        </div>
        <div
          className={`w-full relative before:absolute before:inset-x-0 before:top-0 before:h-0.75 before:rounded-t-3xl ${
            STATUS_ACCENT[ingresso.status] || "before:bg-brand"
          } bg-[#140509]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl shadow-black/80`}
        >
          <span
            className={`self-start font-sans text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-xs ${
              STATUS_STYLE[ingresso.status] || "bg-white/10 text-white/50 border-white/10"
            }`}
          >
            {ingresso.status}
          </span>

          <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-white mt-4 leading-snug">
            {ingresso.eventoTitulo}
          </h1>

          <div className="inline-flex items-center gap-2 mt-2 mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-medium">
              Assento
            </span>
            <span className="text-sm font-bold text-brand">
              {ingresso.assentoCodigo}
            </span>
          </div>

          <div className="w-full flex items-center gap-2 my-2 select-none" aria-hidden="true">
            <div className="h-px flex-1 border-t border-dashed border-white/15" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/30">
              QR CODE DE ENTRADA
            </span>
            <div className="h-px flex-1 border-t border-dashed border-white/15" />
          </div>

          <div className="my-5 p-3.5 bg-white rounded-2xl shadow-xl shadow-black/40 border-4 border-white/90 transition-transform duration-200 hover:scale-[1.02]">
            <QRCodeSVG
              value={ingresso.codigoValidacao}
              size={170}
              level="H"
              includeMargin={false}
            />
          </div>
          {ingresso.codigoValidacao && (
            <div className="flex flex-col items-center gap-1.5 mb-5">
              <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-white/40">
                Código de Validação
              </span>
              <button
                type="button"
                onClick={copiarCodigoValidacao}
                title="Clique para copiar o código"
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <span className="font-mono text-xs font-semibold tracking-wider">
                  {ingresso.codigoValidacao}
                </span>
                <svg className="w-3.5 h-3.5 text-white/40 group-hover:text-brand transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {copiado ? (
                    <polyline points="20 6 9 17 4 12" />
                  ) : (
                    <>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </>
                  )}
                </svg>
              </button>
              {copiado && (
                <span className="text-[10px] text-emerald-400 font-medium animate-in fade-in duration-150">
                  Código copiado!
                </span>
              )}
            </div>
          )}

          <p className="font-sans text-white/40 text-[11px] leading-relaxed max-w-xs mb-6">
            Apresente este QR Code na portaria do evento. Este link é apenas para visualização.
          </p>
          <Link
            to="/"
            className="group w-full flex items-center justify-center gap-2 font-sans text-xs uppercase font-bold tracking-wider py-3.5 px-6 rounded-full bg-linear-to-r from-brand via-[#bd224b] to-brand text-white hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-brand/30"
          >
            <span>Explorar Outros Eventos</span>
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
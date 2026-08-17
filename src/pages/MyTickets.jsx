import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { listarIngressos } from "../services/ticketService";

const STATUS_STYLE = {
  EMITIDO: "bg-emerald-500/20 text-emerald-400",
  UTILIZADO: "bg-white/10 text-white/40",
  CANCELADO: "bg-red-500/20 text-red-400",
};

export default function MyTickets() {
  const [ingressos, setIngressos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    listarIngressos()
      .then(setIngressos)
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, []);

  function copiarLink(ingresso) {
    const link = `${window.location.origin}/ingressos/compartilhado/${ingresso.shareToken}`;
    navigator.clipboard.writeText(link);
    setCopiadoId(ingresso.id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  return (
    <div className="min-h-screen bg-bg px-6 md:px-16 py-12">
      <span className="font-sans text-white/40 text-sm tracking-widest uppercase">
        Sua conta
      </span>
      <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide mt-2">
        MEUS <span className="text-brand">INGRESSOS</span>
      </h1>

      {loading && (
        <p className="font-sans text-white/50 mt-12">Carregando ingressos...</p>
      )}
      {erro && <p className="font-sans text-red-400 mt-12">{erro}</p>}
      {!loading && !erro && ingressos.length === 0 && (
        <p className="font-sans text-white/50 mt-12">
          Você ainda não tem ingressos. Que tal escolher um evento?
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {ingressos.map((ingresso) => (
          <div
            key={ingresso.id}
            className="bg-surface border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center"
          >
            <span
              className={`self-start font-sans text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wide ${
                STATUS_STYLE[ingresso.status] || "bg-white/10 text-white/50"
              }`}
            >
              {ingresso.status}
            </span>

            <h3 className="font-display text-2xl tracking-wide text-white mt-3">
              {ingresso.eventoTitulo}
            </h3>
            <p className="font-sans text-white/50 text-sm mb-4">
              Assento {ingresso.assentoCodigo}
            </p>

            <div className="bg-white p-3 rounded-lg">
              <QRCodeSVG value={ingresso.codigoValidacao} size={140} />
            </div>

            <button
              onClick={() => copiarLink(ingresso)}
              className="font-sans text-sm text-brand hover:text-brand-hover mt-4 underline underline-offset-2"
            >
              {copiadoId === ingresso.id ? "Link copiado!" : "Copiar link de compartilhamento"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
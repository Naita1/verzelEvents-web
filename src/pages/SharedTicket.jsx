import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buscarIngressoPorToken } from "../services/ticketService";

const STATUS_STYLE = {
  EMITIDO: "bg-emerald-500/20 text-emerald-400",
  UTILIZADO: "bg-white/10 text-white/40",
  CANCELADO: "bg-red-500/20 text-red-400",
};

export default function SharedTicket() {
  const { token } = useParams();
  const [ingresso, setIngresso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    buscarIngressoPorToken(token)
      .then(setIngresso)
      .catch(() => setErro("Ingresso não encontrado ou link inválido."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-sans text-white/50">Carregando ingresso...</p>
      </div>
    );
  }

  if (erro || !ingresso) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-sans text-red-400">{erro}</p>
        <Link to="/" className="font-sans text-brand underline">
          Ir para a Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="font-sans text-white/40 text-sm text-center mb-4 tracking-widest uppercase">
          Ingresso compartilhado
        </p>

        <div className="bg-surface border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
          <span
            className={`self-start font-sans text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wide ${
              STATUS_STYLE[ingresso.status] || "bg-white/10 text-white/50"
            }`}
          >
            {ingresso.status}
          </span>

          <h1 className="font-display text-3xl tracking-wide text-white mt-3">
            {ingresso.eventoTitulo}
          </h1>
          <p className="font-sans text-white/50 text-sm mb-4">
            Assento {ingresso.assentoCodigo}
          </p>

          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={ingresso.codigoValidacao} size={160} />
          </div>

          <p className="font-sans text-white/30 text-xs mt-4">
            Este é um link somente de visualização. Para comprar seu próprio ingresso, acesse a plataforma.
          </p>

          <Link
            to="/"
            className="font-sans text-sm font-semibold bg-brand hover:bg-brand-hover text-white rounded-lg px-4 py-2 mt-4 transition-colors"
          >
            Ver todos os eventos
          </Link>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pagarReserva } from "../services/paymentService";

function useCountdown(expiresAt) {
  const [restante, setRestante] = useState(() =>
    Math.max(0, new Date(expiresAt) - new Date())
  );

  useEffect(() => {
    const intervalo = setInterval(() => {
      setRestante(Math.max(0, new Date(expiresAt) - new Date()));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [expiresAt]);

  const minutos = Math.floor(restante / 60000);
  const segundos = Math.floor((restante % 60000) / 1000);

  return { restante, texto: `${minutos}:${String(segundos).padStart(2, "0")}` };
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservas, eventoTitulo } = location.state || {};

  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeTitular, setNomeTitular] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const expiraMaisCedo = useMemo(() => {
    if (!reservas?.length) return null;
    return reservas.reduce((maisCedo, r) =>
      new Date(r.expiresAt) < new Date(maisCedo) ? r.expiresAt : maisCedo,
      reservas[0].expiresAt
    );
  }, [reservas]);

  const { restante, texto } = useCountdown(expiraMaisCedo || Date.now());

  useEffect(() => {
    if (reservas?.length && restante === 0) {
      navigate("/", { state: { expirado: true } });
    }
  }, [restante, reservas, navigate]);

  if (!reservas?.length) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <p className="font-sans text-white/50">Nenhuma reserva pendente encontrada.</p>
        <button onClick={() => navigate("/")} className="font-sans text-brand underline">
          Voltar pra Home
        </button>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setProcessando(true);
    setResultado(null);

    const dadosCartao = { numeroCartao, nomeCartao: nomeTitular, validade, cvv };

    const resultados = await Promise.allSettled(
      reservas.map((r) => pagarReserva(r.id, dadosCartao))
    );

    const sucesso = [];
    const falha = [];

    resultados.forEach((resultado, index) => {
      const reserva = reservas[index];
      if (resultado.status === "fulfilled") {
        sucesso.push({ reserva, ingresso: resultado.value });
      } else {
        falha.push({ reserva, erro: resultado.reason?.message });
      }
    });

    setProcessando(false);
    setResultado({ sucesso, falha });
  }

  if (resultado && resultado.falha.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="font-display text-6xl text-emerald-400 tracking-wide">
          PAGO!
        </span>
        <p className="font-sans text-white/60 max-w-md">
          Seu(s) ingresso(s) para {eventoTitulo} foram confirmados. Acesse "Meus Ingressos" pra ver o QR Code.
        </p>
        <button
          onClick={() => navigate("/meus-ingressos")}
          className="font-sans font-semibold bg-brand hover:bg-brand-hover text-white rounded-lg px-6 py-3 transition-colors"
        >
          Ver meus ingressos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-4xl tracking-wide text-white">
            PAGAMENTO
          </h1>
          <span
            className={`font-sans text-sm font-semibold px-3 py-1 rounded-md ${
              restante < 60000
                ? "bg-red-500/20 text-red-400"
                : "bg-white/10 text-white/70"
            }`}
          >
            {texto}
          </span>
        </div>
        <p className="font-sans text-white/50 text-sm mb-6">
          {reservas.length} ingresso(s) para {eventoTitulo}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-sans text-sm text-white/70 block mb-1">
              Número do cartão
            </label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={numeroCartao}
              onChange={(e) => setNumeroCartao(e.target.value)}
              required
              maxLength={19}
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="font-sans text-sm text-white/70 block mb-1">
              Nome do titular
            </label>
            <input
              type="text"
              value={nomeTitular}
              onChange={(e) => setNomeTitular(e.target.value)}
              required
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-sans text-sm text-white/70 block mb-1">
                Validade
              </label>
              <input
                type="text"
                placeholder="MM/AA"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                required
                maxLength={5}
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors"
              />
            </div>
            <div className="w-24">
              <label className="font-sans text-sm text-white/70 block mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
                maxLength={4}
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          {resultado?.falha.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="font-sans text-red-400 text-sm font-semibold">
                Pagamento recusado
              </p>
              <p className="font-sans text-red-400/80 text-xs mt-1">
                {resultado.falha[0].erro || "Cartão recusado. Verifique os dados e tente novamente."}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={processando}
            className="font-sans font-semibold bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-lg py-3 mt-2 transition-colors"
          >
            {processando ? "Processando..." : "Confirmar pagamento"}
          </button>

          <p className="font-sans text-white/30 text-xs text-center mt-1">
            Pagamento simulado — use qualquer número terminado em 0000 pra testar uma recusa.
          </p>
        </form>
      </div>
    </div>
  );
}
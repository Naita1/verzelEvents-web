import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { listarAssentos, reservarAssento } from "../services/seatService";
import { imagemDoEvento } from "../utils/eventVisuals";
import SeatMap from "../components/SeatMap";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [assentos, setAssentos] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [resultadoParcial, setResultadoParcial] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/eventos/${id}`),
      listarAssentos(id),
    ])
      .then(([eventoRes, assentosData]) => {
        setEvento(eventoRes.data);
        setAssentos(assentosData);
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function toggleAssento(assentoId) {
    setSelecionados((prev) =>
      prev.includes(assentoId)
        ? prev.filter((a) => a !== assentoId)
        : [...prev, assentoId]
    );
  }

  const assentosSelecionadosInfo = assentos.filter((a) =>
    selecionados.includes(a.id)
  );
  const valorTotal = evento
    ? assentosSelecionadosInfo.length * evento.preco
    : 0;

  async function confirmarReserva() {
    setConfirmando(true);
    setResultadoParcial(null);

    const resultados = await Promise.allSettled(
      selecionados.map((assentoId) => reservarAssento(id, assentoId))
    );

    const sucesso = [];
    const falha = [];

    resultados.forEach((resultado, index) => {
      const assentoId = selecionados[index];
      const codigo = assentos.find((a) => a.id === assentoId)?.codigo;

      if (resultado.status === "fulfilled") {
        sucesso.push({ assentoId, codigo, reserva: resultado.value });
      } else {
        falha.push({ assentoId, codigo, erro: resultado.reason?.message });
      }
    });

    setConfirmando(false);
    setResultadoParcial({ sucesso, falha });

    // Remove da seleção os que falharam, mantém só os confirmados
    setSelecionados(sucesso.map((s) => s.assentoId));

    // Atualiza o status visual dos assentos que deram certo
    setAssentos((prev) =>
      prev.map((a) =>
        sucesso.some((s) => s.assentoId === a.id)
          ? { ...a, status: "RESERVADO" }
          : a
      )
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-sans text-white/50">Carregando evento...</p>
      </div>
    );
  }

  if (erro || !evento) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <p className="font-sans text-red-400">{erro || "Evento não encontrado."}</p>
        <button onClick={() => navigate("/")} className="font-sans text-brand underline">
          Voltar pra Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-32">
      <div className="relative h-72 overflow-hidden">
        <img
          src={imagemDoEvento(evento.tipo)}
          alt={evento.titulo}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
      </div>

      <div className="px-6 md:px-16 -mt-16 relative">
        <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide">
          {evento.titulo}
        </h1>
        <p className="font-sans text-white/60 mt-2">
          {evento.local} · R$ {evento.preco.toFixed(2)} por assento
        </p>

        <div className="flex gap-4 mt-8 font-sans text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-surface border border-white/20" /> Livre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-brand" /> Selecionado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-yellow-500/20 border border-yellow-500/40" /> Reservado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-white/5" /> Vendido
          </span>
        </div>

        <div className="mt-4 max-w-xl">
          <SeatMap
            assentos={assentos}
            selecionados={selecionados}
            onToggle={toggleAssento}
          />
        </div>

        {resultadoParcial?.falha.length > 0 && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="font-sans text-red-400 text-sm font-semibold">
              Alguns assentos não puderam ser reservados:
            </p>
            <ul className="font-sans text-red-400/80 text-sm mt-1 list-disc list-inside">
              {resultadoParcial.falha.map((f) => (
                <li key={f.assentoId}>
                  {f.codigo} — {f.erro || "assento já ocupado"}
                </li>
              ))}
            </ul>
          </div>
        )}

        {resultadoParcial?.sucesso.length > 0 && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <p className="font-sans text-emerald-400 text-sm">
              {resultadoParcial.sucesso.length} assento(s) reservado(s) com sucesso! Vá em "Meus Ingressos" para concluir o pagamento.
            </p>
          </div>
        )}
      </div>

      {selecionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 px-6 md:px-16 py-4 flex items-center justify-between">
          <div className="font-sans text-white">
            <span className="text-white/50 text-sm">
              {selecionados.length} assento(s) selecionado(s)
            </span>
            <p className="font-display text-2xl text-brand">
              R$ {valorTotal.toFixed(2)}
            </p>
          </div>
          <button
            onClick={confirmarReserva}
            disabled={confirmando}
            className="font-sans font-semibold bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-lg px-6 py-3 transition-colors"
          >
            {confirmando ? "Reservando..." : "Confirmar Reserva"}
          </button>
        </div>
      )}
    </div>
  );
}
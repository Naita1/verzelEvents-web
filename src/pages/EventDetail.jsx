import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import { listarAssentos, reservarAssento } from "../services/seatService";
import { usePosterEvento } from "../utils/usePosterEvento";
import SeatMap from "../components/SeatMap";

import bgImage from "../assets/background3.jpg";

function gerarLayoutDinamico(totalAssentos) {
  if (!totalAssentos || totalAssentos === 0) {
    return { rowLabels: [], groupSizes: [2, 6, 2] };
  }

  const POR_FILEIRA = 10;
  const totalFileiras = Math.ceil(totalAssentos / POR_FILEIRA);

  const rowLabels = Array.from({ length: totalFileiras }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  return {
    rowLabels,
    groupSizes: [2, 6, 2],
  };
}

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

  const { imageUrl, imgLoading, imgReady, marcarPronto, marcarErro } =
    usePosterEvento(evento);

  useEffect(() => {
    Promise.all([
      api.get(`/eventos/${id}`),
      listarAssentos(id),
    ])
      .then(([eventoRes, assentosData]) => {
        setEvento(eventoRes.data);
        setAssentos(assentosData || []);
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const limiteLiberado = useMemo(() => {
    return evento?.quantidadeIngressos || evento?.capacidade || assentos.length;
  }, [evento, assentos.length]);

  const assentosOcupados = useMemo(() => {
    return assentos.filter(
      (a) => a.status === "RESERVADO" || a.status === "VENDIDO" || a.status === "OCUPADO"
    ).length;
  }, [assentos]);

  const vagasDisponiveisNoEvento = useMemo(() => {
    return Math.max(0, limiteLiberado - assentosOcupados);
  }, [limiteLiberado, assentosOcupados]);

  const toggleAssentoPorId = useCallback((assentoId) => {
    const assento = assentos.find((a) => a.id === assentoId);
    if (!assento) return;

    const isOcupado =
      assento.status === "OCUPADO" ||
      assento.status === "RESERVADO" ||
      assento.status === "VENDIDO";
      
    if (isOcupado) return;

    setSelecionados((prevSelecionados) => {
      const jaSelecionado = prevSelecionados.includes(assentoId);
      if (!jaSelecionado && prevSelecionados.length >= vagasDisponiveisNoEvento) {
        return prevSelecionados;
      }
      return jaSelecionado
        ? prevSelecionados.filter((aId) => aId !== assentoId)
        : [...prevSelecionados, assentoId];
    });
  }, [assentos, vagasDisponiveisNoEvento]);

  const precoUnitario = useMemo(() => {
    return Number(evento?.preco || evento?.valorIngresso || evento?.valor || 0);
  }, [evento]);

  const valorTotal = useMemo(() => {
    return selecionados.length * precoUnitario;
  }, [selecionados.length, precoUnitario]);

  const layoutDinamico = useMemo(() => ({
    type: "rows-aisle",
    ...gerarLayoutDinamico(assentos.length),
  }), [assentos.length]);

  async function confirmarReserva() {
    if (selecionados.length === 0) return;
    setConfirmando(true);
    setResultadoParcial(null);

    try {
      const resultados = await Promise.allSettled(
        selecionados.map((assentoId) => reservarAssento(id, assentoId))
      );

      const sucesso = [];
      const falha = [];

      resultados.forEach((resultado, index) => {
        const assentoId = selecionados[index];
        const codigo = assentos.find((a) => a.id === assentoId)?.codigo || assentoId;

        if (resultado.status === "fulfilled") {
          sucesso.push({ assentoId, codigo, reserva: resultado.value });
        } else {
          const msg = resultado.reason?.response?.data?.message || resultado.reason?.message || "Erro na reserva";
          falha.push({ assentoId, codigo, erro: msg });
        }
      });

      if (sucesso.length > 0) {
        setAssentos((prev) =>
          prev.map((a) =>
            sucesso.some((s) => s.assentoId === a.id)
              ? { ...a, status: "RESERVADO" }
              : a
          )
        );
      }

      if (falha.length === 0 && sucesso.length > 0) {
        setSelecionados([]);
        navigate("/pagamento", {
          state: {
            reservas: sucesso.map((s) => s.reserva),
            eventoTitulo: evento.titulo,
          },
        });
      } else {
        setResultadoParcial({ sucesso, falha });
        setSelecionados(falha.map((f) => f.assentoId));
      }
    } catch {
      setErro("Ocorreu um erro ao processar a reserva.");
    } finally {
      setConfirmando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0b0e] flex items-center justify-center pt-32">
        <p className="font-sans text-white/50 text-xs tracking-widest uppercase">Carregando evento...</p>
      </div>
    );
  }

  if (erro || !evento) {
    return (
      <div className="min-h-screen bg-[#0d0b0e] flex flex-col items-center justify-center gap-4 px-6 pt-32 text-center">
        <p className="font-sans text-red-400 font-medium">{erro || "Evento não encontrado."}</p>
        <button
          onClick={() => navigate("/")}
          className="font-sans font-semibold text-xs uppercase tracking-wider bg-[#a11b3e] text-white rounded-full px-6 py-3 transition-colors"
        >
          Voltar para a Home
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white pt-28 pb-32 px-4 md:px-8 lg:px-12 font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transform-gpu">
        <img
          src={bgImage}
          alt="Background Eventos"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a050b]/85 via-[#0f0407]/90 to-[#0d0b0e]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 bg-[#2a0e16]/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-6 bg-[#18080c] border border-white/10 flex items-center justify-center">
              {imgLoading && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />
              )}

              {!imgLoading && imageUrl && (
                <img
                  src={imageUrl}
                  alt={evento.titulo}
                  onLoad={marcarPronto}
                  onError={marcarErro}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imgReady ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {!imgLoading && !imageUrl && (
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-[#a11b3e]/20 border border-[#a11b3e] flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-[#a11b3e]">
                      {evento.titulo ? evento.titulo.charAt(0).toUpperCase() : "E"}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Pôster Indisponível</p>
                </div>
              )}

              <span className="absolute top-4 left-4 bg-[#a11b3e] text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md z-10">
                {evento.tipo || "CINEMA"}
              </span>
            </div>

            <h1 className="font-display text-2xl uppercase tracking-wider text-white font-bold mb-4">
              {evento.titulo}
            </h1>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-white/70 space-y-3">
            <p><strong className="text-white">Local:</strong> {evento.local}</p>
            <p><strong className="text-white">Ingresso:</strong> R$ {precoUnitario.toFixed(2)}</p>
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#2a0e16]/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center gap-4 sm:gap-6 text-[10px] uppercase font-bold tracking-widest text-white/40 pb-6 border-b border-white/10 overflow-x-auto whitespace-nowrap no-scrollbar">
              <span>01 Escolha o Filme</span>
              <span className="text-[#a11b3e] border-b-2 border-[#a11b3e] pb-1">02 Escolha os Assentos</span>
              <span>03 Pagamento</span>
              <span>04 Concluído</span>
            </div>
                        
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-white/10">
              <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide font-bold">
                {evento.titulo}
              </h1>

              <div className="flex items-center gap-3 text-xs">
                <span className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-full text-white/80">
                  {evento.duracao || "106"} minutos
                </span>
                <span className="bg-[#a11b3e] text-white font-bold px-3 py-1.5 rounded-full text-[10px] tracking-wider uppercase">
                  {evento.classificacao || "PG-13"}
                </span>
              </div>
            </div>

            <div className="mt-8 mb-6 flex flex-col items-center">
              <div className="w-full max-w-xl h-2 border-t-2 border-[#a11b3e] rounded-t-[100%] shadow-[0_-6px_12px_rgba(161,27,62,0.5)]" />
              <span className="text-[9px] tracking-[0.4em] text-white/40 uppercase mt-2 font-semibold">
                T E L A
              </span>
            </div>
            
            <div className="py-4 overflow-x-auto flex justify-center">
              <div className="min-w-fit">
                <SeatMap
                  assentos={assentos}
                  selecionados={selecionados}
                  onToggle={toggleAssentoPorId}
                  layout={layoutDinamico}
                  limiteAtingido={selecionados.length >= vagasDisponiveisNoEvento}
                />
              </div>
            </div>
          </div>
          
          <div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-8 text-xs text-white/60">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-[#a11b3e]" /> Selecionado
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-white/20" /> Disponível
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-red-950/80 border border-red-800/40" /> Ocupado
              </span>
            </div>

            {resultadoParcial?.falha?.length > 0 && (
              <div className="mt-6 bg-red-950/80 border border-red-500/50 rounded-xl p-4 text-xs text-red-200">
                <p className="font-bold mb-1">Erro ao reservar assento(s):</p>
                <ul className="list-disc list-inside space-y-1">
                  {resultadoParcial.falha.map((f, i) => (
                    <li key={i}>
                      Assento {f.codigo}: {f.erro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selecionados.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-[#2a0e16] border border-white/15 rounded-full px-8 py-4 flex items-center justify-between shadow-2xl z-50">
          <div>
            <span className="text-white/50 text-[10px] tracking-widest uppercase block">
              {selecionados.length} assento(s) selecionado(s)
            </span>
            <p className="font-display text-2xl text-[#a11b3e] font-bold">
              R$ {valorTotal.toFixed(2)}
            </p>
          </div>
          <button
            onClick={confirmarReserva}
            disabled={confirmando}
            className="font-semibold text-xs uppercase tracking-wider bg-[#e2e8f0] text-black hover:bg-white disabled:opacity-50 rounded-full px-8 py-3.5 transition-colors shadow-lg"
          >
            {confirmando ? "Reservando..." : "Confirmar Reserva"}
          </button>
        </div>
      )}
    </div>
  );
}
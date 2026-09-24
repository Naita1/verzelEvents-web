import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useCallback } from "react";
import { useEventDetail } from "../features/events/hooks/useEventDetail";
import { usePosterEvento } from "../utils/usePosterEvento";
import SeatMap from "../components/SeatMap";

function formatarMoeda(valor) {
  const num = Number(valor || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

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

  const [selecionados, setSelecionados] = useState([]);
  const [resultadoParcial, setResultadoParcial] = useState(null);
  const {
    evento,
    assentos,
    isLoading: loading,
    error,
    reservarMutation,
  } = useEventDetail(id);
  const erro = error?.message;
  const confirmando = reservarMutation.isPending;

  const { imageUrl, imgLoading, imgReady, marcarPronto, marcarErro } =
    usePosterEvento(evento);

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
    setResultadoParcial(null);

    try {
      const { resultados } = await reservarMutation.mutateAsync({
        eventoId: id,
        assentoIds: selecionados,
      });

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
    } catch (err) {
      setResultadoParcial({
        sucesso: [],
        falha: selecionados.map((assentoId) => ({
          assentoId,
          codigo: assentos.find((a) => a.id === assentoId)?.codigo || assentoId,
          erro: err.message || "Erro na reserva",
        })),
      });
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-bg flex items-center justify-center pt-32 font-sans overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 right-0 w-140 h-140 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
          <p className="font-sans text-white/60 text-xs tracking-widest uppercase font-semibold">
            Carregando detalhes do evento...
          </p>
        </div>
      </div>
    );
  }

  if (erro || !evento) {
    return (
      <div className="relative min-h-screen bg-bg flex flex-col items-center justify-center gap-5 px-6 pt-32 text-center font-sans overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 right-0 w-140 h-140 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-white tracking-wide uppercase">Evento Indisponível</h2>
        <p className="font-sans text-white/60 text-sm max-w-sm">{erro || "Não foi possível carregar as informações deste evento."}</p>
        <button
          onClick={() => navigate("/")}
          className="font-sans font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand text-white rounded-full px-8 py-3.5 shadow-lg shadow-brand/30 hover:brightness-110 transition-all cursor-pointer"
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
        <div className="absolute inset-0 bg-linear-to-b from-[#140509]/90 via-[#0b0306]/92 to-[#090204]" />
        <div
          className="pointer-events-none absolute -top-40 right-0 w-140 h-140 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-120 h-120 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 bg-[#140509]/85 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-2xl">
          <div>
            <div className="relative aspect-3/4 w-full rounded-2xl overflow-hidden mb-6 bg-[#0d0305] border border-white/10 flex items-center justify-center shadow-xl">
              {imgLoading && (
                <div className="absolute inset-0 animate-pulse bg-linear-to-br from-zinc-800 to-zinc-900" />
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
                  <div className="w-12 h-12 rounded-2xl bg-brand/20 border border-brand/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <span className="text-lg font-bold text-brand">
                      {evento.titulo ? evento.titulo.charAt(0).toUpperCase() : "E"}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Pôster Indisponível</p>
                </div>
              )}

              <span className="absolute top-4 left-4 bg-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg z-10 border border-white/20">
                {evento.tipo || "CINEMA"}
              </span>
            </div>

            <h1 className="font-display text-2xl uppercase tracking-wider text-white font-bold mb-3 leading-snug">
              {evento.titulo}
            </h1>
            {evento.descricao && (
              <p className="font-sans text-xs text-white/60 leading-relaxed mb-4 line-clamp-3">
                {evento.descricao}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-white/70 space-y-2.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate" title={evento.local}>{evento.local}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-white/50 text-[11px] uppercase tracking-wider">Valor unitário:</span>
              <span className="text-emerald-400 font-bold text-sm">{formatarMoeda(precoUnitario)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#140509]/85 border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between backdrop-blur-2xl">
          <div>
            <div className="flex items-center gap-4 sm:gap-6 text-[10px] uppercase font-bold tracking-widest text-white/40 pb-6 border-b border-white/10 overflow-x-auto whitespace-nowrap scrollbar-none">
              <span>01 Escolha o Filme</span>
              <span className="text-brand border-b-2 border-brand pb-1">02 Escolha os Assentos</span>
              <span>03 Pagamento</span>
              <span>04 Concluído</span>
            </div>
                        
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-white/10">
              <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide font-bold">
                {evento.titulo}
              </h1>

              <div className="flex items-center gap-3 text-xs">
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/80">
                  {evento.duracao || "106"} minutos
                </span>
                <span className="bg-brand text-white font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">
                  {evento.classificacao || "PG-13"}
                </span>
              </div>
            </div>
            <div className="mt-8 mb-6 flex flex-col items-center">
              <div className="w-full max-w-xl h-2.5 border-t-2 border-brand rounded-t-[100%] shadow-[0_-8px_20px_rgba(161,27,62,0.5)]" />
              <span className="text-[10px] tracking-[0.4em] text-white/40 uppercase mt-2.5 font-bold">
                T E L A  /  P A L C O
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
                <span className="w-3.5 h-3.5 rounded-md bg-brand border border-brand/50 shadow-xs" /> Selecionado
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-white/20 border border-white/20" /> Disponível
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-red-950/80 border border-red-800/40 opacity-50" /> Ocupado
              </span>
            </div>

            {resultadoParcial?.falha?.length > 0 && (
              <div className="mt-6 bg-red-950/80 border border-red-500/50 rounded-2xl p-4 text-xs text-red-200">
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-[#140509]/95 backdrop-blur-2xl border border-white/20 rounded-full px-7 py-3.5 flex items-center justify-between shadow-2xl shadow-black/90 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div>
            <span className="text-white/50 text-[10px] tracking-widest uppercase font-semibold block">
              {selecionados.length} assento(s) selecionado(s)
            </span>
            <p className="font-display text-2xl text-emerald-400 font-bold">
              {formatarMoeda(valorTotal)}
            </p>
          </div>
          <button
            onClick={confirmarReserva}
            disabled={confirmando}
            className="font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand text-white hover:brightness-110 active:scale-95 disabled:opacity-50 rounded-full px-8 py-3.5 transition-all shadow-lg shadow-brand/30 cursor-pointer flex items-center gap-2"
          >
            {confirmando ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Reservando...</span>
              </>
            ) : (
              <span>Confirmar Reserva</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
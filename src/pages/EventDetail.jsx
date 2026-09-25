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

function formatarDataHora(dataString) {
  if (!dataString) return null;
  try {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  } catch {
    return null;
  }
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

            <h2 className="font-display text-2xl uppercase tracking-wider text-white font-bold mb-3 leading-snug">
              {evento.titulo}
            </h2>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {evento.dataHora && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 text-[11px] font-sans">
                  <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatarDataHora(evento.dataHora)}
                </span>
              )}
              {evento.duracao && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[11px] font-sans">
                  {evento.duracao} min
                </span>
              )}
            </div>

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
            <nav aria-label="Progresso da compra" className="flex items-center gap-2 sm:gap-3 text-xs font-semibold pb-5 border-b border-white/10 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span className="hidden sm:inline">01. Evento</span>
              </div>
              <span className="text-white/20">/</span>
              <div className="flex items-center gap-2 text-white">
                <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-brand/40">2</span>
                <span className="font-bold tracking-wide">02. Assentos</span>
              </div>
              <span className="text-white/20">/</span>
              <div className="flex items-center gap-2 text-white/40">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">3</span>
                <span className="hidden sm:inline">03. Pagamento</span>
              </div>
              <span className="text-white/20">/</span>
              <div className="flex items-center gap-2 text-white/40">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">4</span>
                <span className="hidden sm:inline">04. Concluído</span>
              </div>
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 pb-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl text-white tracking-wide font-bold">
                  SELEÇÃO DE ASSENTOS
                </h1>
                <p className="font-sans text-xs text-white/50 mt-1">
                  Clique sobre os assentos desejados no mapa abaixo.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70">
                {vagasDisponiveisNoEvento} lugares disponíveis
              </span>
            </div>

            <div className="mt-6 mb-4 flex flex-col items-center">
              <div className="w-full max-w-lg h-10 bg-linear-to-b from-brand/20 via-brand/5 to-transparent rounded-t-[100px] border-t-2 border-brand shadow-[0_-8px_30px_rgba(161,27,62,0.4)] flex items-center justify-center" />
              <span className="text-[10px] tracking-[0.45em] text-white/40 uppercase mt-2 font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                T E L A  /  P A L C O
              </span>
            </div>
            
            <div className="py-2 overflow-x-auto flex justify-center scrollbar-thin">
              <div className="min-w-fit px-2">
                <SeatMap
                  assentos={assentos}
                  selecionados={selecionados}
                  onToggle={toggleAssentoPorId}
                  layout={layoutDinamico}
                  limiteAtingido={selecionados.length >= vagasDisponiveisNoEvento}
                />
              </div>
            </div>

            {selecionados.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 mr-1">
                  Selecionados ({selecionados.length}):
                </span>
                {selecionados.map((id) => {
                  const assentoObj = assentos.find((a) => a.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand/20 border border-brand/40 text-brand text-xs font-mono font-bold"
                    >
                      {assentoObj?.codigo || id}
                      <button
                        type="button"
                        onClick={() => toggleAssentoPorId(id)}
                        className="hover:text-white transition-colors cursor-pointer text-sm leading-none"
                        title="Remover assento"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          
          <div>
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/70">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="w-3.5 h-3.5 rounded-md bg-white/20 border border-white/30" />
                <span className="text-[11px] font-medium">Disponível</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/15 border border-brand/40">
                <span className="w-3.5 h-3.5 rounded-md bg-brand border border-brand/60 shadow-xs ring-2 ring-brand/30" />
                <span className="text-[11px] font-semibold text-brand">Selecionado</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 opacity-60">
                <span className="w-3.5 h-3.5 rounded-md bg-red-950/80 border border-red-800/40" />
                <span className="text-[11px] font-medium text-white/40">Ocupado</span>
              </div>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-xl bg-[#140509]/95 backdrop-blur-2xl border border-brand/30 rounded-2xl sm:rounded-full px-5 sm:px-7 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl shadow-black/90 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center sm:text-left">
            <span className="text-white/60 text-[10px] tracking-widest uppercase font-semibold block">
              {selecionados.length} assento(s) selecionado(s)
            </span>
            <p className="font-display text-2xl text-emerald-400 font-bold leading-tight">
              {formatarMoeda(valorTotal)}
            </p>
          </div>
          <button
            onClick={confirmarReserva}
            disabled={confirmando}
            className="w-full sm:w-auto font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand text-white hover:brightness-110 active:scale-95 disabled:opacity-50 rounded-full px-8 py-3.5 transition-all shadow-lg shadow-brand/30 cursor-pointer flex items-center justify-center gap-2"
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
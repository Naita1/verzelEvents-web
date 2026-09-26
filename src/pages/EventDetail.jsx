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

function formatarDataCompacta(data) {
  if (!data || Number.isNaN(data.getTime())) return null;
  return {
    semana: data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase(),
    dia: data.toLocaleDateString("pt-BR", { day: "2-digit" }),
    mes: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
    horario: data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
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
  const dataSessao = formatarDataCompacta(evento?.dataHora ? new Date(evento.dataHora) : null);

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
        <div className="absolute inset-0 bg-linear-to-b from-[#140509]/90 via-bg/92 to-[#090204]" />
        <div
          className="pointer-events-none absolute -top-40 right-0 w-140 h-140 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-120 h-120 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
        <div className="lg:col-span-4 bg-[#140509]/85 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl">
          <div>
            <div className="relative aspect-3/4 w-full rounded-xl overflow-hidden mb-5 bg-[#0d0305] border border-white/10 flex items-center justify-center shadow-xl">
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
              <a
                href="#informacoes-evento"
                className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-bg/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Mais informações
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </a>
            </div>

            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Atração principal</p>
            <h2 className="font-display text-2xl uppercase text-white font-bold mb-3 leading-snug">
              {evento.titulo}
            </h2>

            <section className="border-t border-white/10 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Lineup / artista</p>
              <p className="mt-1 text-sm text-white/80">{evento.artista || evento.lineup || "Detalhes do artista não informados"}</p>
            </section>

            <section className="border-t border-white/10 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Gênero / tipo</p>
              <p className="mt-1 text-sm text-white/80">{evento.genero || evento.tipo || "Evento"}</p>
            </section>

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

            <section id="informacoes-evento" className="border-t border-white/10 pt-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Informações adicionais</p>
              <p className="mt-1 font-sans text-xs text-white/60 leading-relaxed line-clamp-4">
                {evento.descricao || "Informações adicionais não disponíveis."}
              </p>
            </section>
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

        <div className="lg:col-span-8 min-w-0 bg-[#140509]/85 border border-white/15 rounded-2xl p-4 sm:p-6 md:p-7 shadow-2xl backdrop-blur-2xl">
          <div>
            <nav aria-label="Progresso da compra" className="flex items-center gap-2 sm:gap-3 text-xs font-semibold pb-5 border-b border-white/10 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span className="hidden sm:inline">01. Escolher evento</span>
              </div>
              <span className="text-white/20">/</span>
              <div className="flex items-center gap-2 text-white">
                <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-brand/40">2</span>
                <span className="font-bold tracking-wide">02. Escolher lugares</span>
              </div>
              <span className="text-white/20">/</span>
              <div className="flex items-center gap-2 text-white/40">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">3</span>
                <span className="hidden sm:inline">03. Pagamento</span>
              </div>
              <span className="text-white/20">/</span>
              <div className="flex items-center gap-2 text-white/40">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">4</span>
                <span className="hidden sm:inline">04. Concluir</span>
              </div>
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 pb-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl text-white tracking-wide font-bold">
                  {evento.titulo}
                </h1>
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-sans text-[11px] text-white/55">
                  <span>{evento.duracao ? `${evento.duracao} min` : "Duração não informada"}</span>
                  <span>{evento.classificacaoIndicativa || evento.classificacao || "Classificação não informada"}</span>
                  {evento.dataHora && <span>{formatarDataHora(evento.dataHora)}</span>}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70">
                {vagasDisponiveisNoEvento} lugares disponíveis
              </span>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 border-y border-white/10 py-3.5">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">Data</p>
                {dataSessao ? (
                  <span aria-current="date" className="flex min-w-14 flex-col items-center rounded-lg border border-brand/50 bg-brand/15 px-3 py-1.5 text-white">
                    <span className="text-[9px] font-bold text-brand">{dataSessao.semana}</span>
                    <span className="text-sm font-bold">{dataSessao.dia} <span className="text-[9px]">{dataSessao.mes}</span></span>
                  </span>
                ) : <span className="text-xs text-white/55">Data a confirmar</span>}
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">Sessão</p>
                {dataSessao ? (
                  <span aria-current="true" className="inline-flex min-w-20 items-center justify-center rounded-lg border border-brand/50 bg-brand/15 px-4 py-2 text-xs font-bold text-white">
                    {dataSessao.horario}
                  </span>
                ) : <span className="text-xs text-white/55">Horário a confirmar</span>}
              </div>
              <span className="pb-2 text-[11px] text-white/45">{vagasDisponiveisNoEvento} lugares disponíveis</span>
            </div>

            <div className="relative mt-4 rounded-xl border border-white/10 bg-bg/35 px-2 py-5 pb-20 sm:px-4">
              <SeatMap
                assentos={assentos}
                selecionados={selecionados}
                onToggle={toggleAssentoPorId}
                layout={layoutDinamico}
                limiteAtingido={selecionados.length >= vagasDisponiveisNoEvento}
              />

              <button
                type="button"
                onClick={confirmarReserva}
                disabled={selecionados.length === 0 || confirmando}
                aria-label={confirmando ? "Reservando assentos" : "Avançar para pagamento"}
                title={confirmando ? "Reservando..." : "Avançar para pagamento"}
                className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-brand text-white shadow-lg shadow-brand/25 transition-[transform,background-color,opacity] duration-100 hover:enabled:scale-105 hover:enabled:bg-brand/85 active:enabled:scale-95 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {confirmando ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" className="opacity-25" />
                    <path d="M4 12a8 8 0 0 1 8-8" className="opacity-90" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
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
                <span className="ml-auto text-xs font-semibold text-emerald-400">{formatarMoeda(valorTotal)}</span>
              </div>
            )}
          </div>
          
          <div>
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
    </div>
  );
}
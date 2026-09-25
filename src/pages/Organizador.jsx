import { useState, useEffect } from "react";
import { buscarFilmesTMDb, criarEvento, listarMeusEventos } from "../services/api";

const TIPO_LABEL = {
  CINEMA: "Cinema",
  SHOW: "Show",
  TEATRO: "Teatro",
};

function formatarMoeda(valor) {
  const num = Number(valor || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatarDataHora(dataString) {
  if (!dataString) return "";
  try {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  } catch {
    return dataString;
  }
}

export default function Organizador() {
  const [query, setQuery] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultadosCatalogo, setResultadosCatalogo] = useState([]);

  const [form, setForm] = useState({
    titulo: "",
    tipo: "CINEMA",
    dataHora: "",
    local: "",
    capacidade: 80,
    preco: 30.0,
    externalId: null,
  });

  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const [meusEventos, setMeusEventos] = useState([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setVisivel(true);
    });
    carregarEventos();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  async function carregarEventos() {
    setCarregandoEventos(true);
    try {
      const data = await listarMeusEventos();
      setMeusEventos(data);
    } catch {
      //Tratamento silencioso
    } finally {
      setCarregandoEventos(false);
    }
  }

  async function handleBuscarCatalogo(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setBuscando(true);
    try {
      const resultados = await buscarFilmesTMDb(query);
      setResultadosCatalogo(resultados);
    } catch {
      setResultadosCatalogo([]);
    } finally {
      setBuscando(false);
    }
  }

  function selecionarDoCatalogo(item) {
    setForm((prev) => ({
      ...prev,
      titulo: item.titulo,
      externalId: item.externalId || item.id,
      tipo: "CINEMA",
    }));
    setResultadosCatalogo([]);
    setQuery("");
  }

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleCriarEvento(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setCriando(true);

    try {
      await criarEvento({
        ...form,
        capacidade: Number(form.capacidade),
        preco: Number(form.preco),
      });

      setSucesso(true);
      setForm({
        titulo: "",
        tipo: "CINEMA",
        dataHora: "",
        local: "",
        capacidade: 80,
        preco: 30.0,
        externalId: null,
      });

      carregarEventos();
    } catch (err) {
      setErro(
        err.response?.data?.message ||
          "Erro ao criar evento. Verifique os dados e tente novamente."
      );
    } finally {
      setCriando(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-bg px-4 sm:px-8 md:px-12 lg:px-16 pt-28 pb-24 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 right-1/4 w-140 h-140 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 left-10 w-120 h-120 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div
          className={`transition-all duration-700 ease-out mb-10 ${
            visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 mb-3 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-[10px] font-bold text-brand uppercase tracking-[0.22em]">
              Painel do Produtor
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase">
            GESTÃO DE{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand via-[#e63968] to-brand">
              EVENTOS
            </span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-white/50 max-w-xl mt-2 leading-relaxed">
            Cadastre novos espetáculos, sincronize pôsteres do catálogo TMDb e monitore suas atrações ativas na plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div
            className={`lg:col-span-7 bg-[#140509]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-500 ease-out delay-75 ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
              <div>
                <h2 className="font-display text-2xl tracking-wide text-white uppercase">
                  Novo Evento
                </h2>
                <p className="font-sans text-white/40 text-xs mt-0.5">
                  Sincronize via TMDb ou informe os dados do espetáculo
                </p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand text-sm font-bold">
                +
              </span>
            </div>
            <div className="bg-[#0b0306]/80 border border-white/10 rounded-2xl p-4 sm:p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-brand"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="font-sans text-[11px] font-bold text-white/70 uppercase tracking-wider">
                  Preenchimento Automático (Catálogo TMDb)
                </span>
              </div>

              <form onSubmit={handleBuscarCatalogo} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ex.: Batman, Wicked, Oppenheimer..."
                    className="w-full bg-[#140509] border border-white/10 rounded-xl px-4 py-2.5 text-white font-sans text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 placeholder:text-white/25"
                  />
                </div>
                <button
                  type="submit"
                  disabled={buscando || !query.trim()}
                  className="font-sans text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-brand active:scale-95 disabled:opacity-40 text-white rounded-xl px-5 py-2.5 transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
                >
                  {buscando ? (
                    <svg
                      className="w-4 h-4 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    "Buscar"
                  )}
                </button>
              </form>

              {resultadosCatalogo.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">
                    Selecione para importar título e data:
                  </p>
                  {resultadosCatalogo.map((item, index) => (
                    <button
                      key={item.externalId || item.id || index}
                      type="button"
                      onClick={() => selecionarDoCatalogo(item)}
                      className="flex items-center gap-3 bg-[#140509] border border-white/10 hover:border-brand hover:bg-brand/10 rounded-xl p-2.5 text-left transition-all duration-200 group cursor-pointer"
                    >
                      {item.posterUrl ? (
                        <img
                          src={item.posterUrl}
                          alt={item.titulo}
                          className="w-9 h-12 object-cover rounded-lg shrink-0 shadow-md group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-9 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-[10px] shrink-0 font-bold">
                          🎬
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-sm font-semibold text-white group-hover:text-brand transition-colors truncate">
                          {item.titulo}
                        </p>
                        <p className="font-sans text-[11px] text-white/40">
                          Lançamento: {item.dataLancamento || "Não informado"}
                        </p>
                      </div>
                      <span className="text-white/30 group-hover:text-brand transition-colors text-xs pr-1">
                        Importar →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <form onSubmit={handleCriarEvento} className="flex flex-col gap-4">
              <div>
                <label className="font-sans text-[11px] text-white/60 font-bold uppercase tracking-wider block mb-1.5">
                  Título do Evento
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => atualizarCampo("titulo", e.target.value)}
                  placeholder="Nome do filme, show ou peça"
                  required
                  className="w-full bg-[#0b0306]/90 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 placeholder:text-white/25"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[11px] text-white/60 font-bold uppercase tracking-wider block mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => atualizarCampo("tipo", e.target.value)}
                    className="w-full bg-[#0b0306]/90 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 cursor-pointer"
                  >
                    <option value="CINEMA" className="bg-[#140509]">Cinema</option>
                    <option value="SHOW" className="bg-[#140509]">Show</option>
                    <option value="TEATRO" className="bg-[#140509]">Teatro</option>
                  </select>
                </div>
                <div>
                  <label className="font-sans text-[11px] text-white/60 font-bold uppercase tracking-wider block mb-1.5">
                    Data e Horário
                  </label>
                  <input
                    type="datetime-local"
                    value={form.dataHora}
                    onChange={(e) => atualizarCampo("dataHora", e.target.value)}
                    required
                    className="w-full bg-[#0b0306]/90 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 scheme-dark"
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-[11px] text-white/60 font-bold uppercase tracking-wider block mb-1.5">
                  Local ou Sala
                </label>
                <input
                  type="text"
                  value={form.local}
                  onChange={(e) => atualizarCampo("local", e.target.value)}
                  placeholder="Ex.: Sala IMAX 01, Teatro Municipal, Arena Allianz"
                  required
                  className="w-full bg-[#0b0306]/90 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 placeholder:text-white/25"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[11px] text-white/60 font-bold uppercase tracking-wider block mb-1.5">
                    Capacidade (Assentos)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      value={form.capacidade}
                      onChange={(e) => atualizarCampo("capacidade", e.target.value)}
                      placeholder="Ex.: 80"
                      required
                      className="w-full bg-[#0b0306]/90 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 placeholder:text-white/25"
                    />
                    <span className="absolute right-3 text-xs text-white/40 pointer-events-none">
                      lugares
                    </span>
                  </div>
                </div>
                <div>
                  <label className="font-sans text-[11px] text-white/60 font-bold uppercase tracking-wider block mb-1.5">
                    Valor do Ingresso
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-white/40 pointer-events-none">
                      R$
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.preco}
                      onChange={(e) => atualizarCampo("preco", e.target.value)}
                      placeholder="0,00"
                      required
                      className="w-full bg-[#0b0306]/90 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-sans text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 placeholder:text-white/25"
                    />
                  </div>
                </div>
              </div>

              {erro && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <svg
                    className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="font-sans text-xs text-red-300 leading-snug">{erro}</p>
                </div>
              )}

              {sucesso && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <svg
                    className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="font-sans text-xs text-emerald-300 leading-snug">
                    Evento criado com sucesso e adicionado à grade de vendas!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={criando}
                className="w-full font-sans font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand text-white rounded-full py-3.5 mt-2 transition-all duration-300 shadow-lg shadow-brand/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {criando ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Publicando Evento...</span>
                  </>
                ) : (
                  <span>Publicar Evento na Plataforma</span>
                )}
              </button>
            </form>
          </div>
          <div
            className={`lg:col-span-5 bg-[#140509]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-500 ease-out delay-150 flex flex-col justify-between ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
                <div>
                  <h2 className="font-display text-2xl tracking-wide text-white uppercase">
                    Atrações Ativas
                  </h2>
                  <p className="font-sans text-white/40 text-xs mt-0.5">
                    Espetáculos publicados pela sua organização
                  </p>
                </div>
                {!carregandoEventos && (
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-brand rounded-full px-3 py-1 shadow-xs">
                    {meusEventos.length} {meusEventos.length === 1 ? "evento" : "eventos"}
                  </span>
                )}
              </div>

              {carregandoEventos && (
                <div className="flex flex-col gap-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-[#0b0306]/90 border border-white/10 rounded-2xl p-4.5 animate-pulse"
                    >
                      <div className="h-4 w-3/4 rounded bg-white/10 mb-2.5" />
                      <div className="h-3 w-1/2 rounded bg-white/5" />
                    </div>
                  ))}
                </div>
              )}

              {!carregandoEventos && meusEventos.length === 0 && (
                <div className="flex flex-col items-center text-center py-16 px-4 bg-[#0b0306]/50 rounded-2xl border border-dashed border-white/10 my-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mb-4 text-brand shadow-inner">
                    <svg
                      className="w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                      <line x1="7" y1="2" x2="7" y2="22" />
                      <line x1="17" y1="2" x2="17" y2="22" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <line x1="2" y1="7" x2="7" y2="7" />
                      <line x1="2" y1="17" x2="7" y2="17" />
                      <line x1="17" y1="17" x2="22" y2="17" />
                      <line x1="17" y1="7" x2="22" y2="7" />
                    </svg>
                  </div>
                  <p className="font-display text-lg text-white uppercase tracking-wide mb-1">
                    Nenhum evento criado
                  </p>
                  <p className="font-sans text-white/40 text-xs max-w-xs leading-relaxed">
                    Cadastre seu primeiro evento ao lado para começar a comercializar ingressos com assentos numerados.
                  </p>
                </div>
              )}

              {!carregandoEventos && meusEventos.length > 0 && (
                <ul className="flex flex-col gap-3.5 max-h-135 overflow-y-auto pr-1">
                  {meusEventos.map((evento, index) => (
                    <li
                      key={evento.id || index}
                      className="bg-[#0b0306]/90 border border-white/10 hover:border-brand/40 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 shadow-md flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-sans text-white font-bold text-sm tracking-wide group-hover:text-brand transition-colors truncate">
                            {evento.titulo}
                          </h3>
                          {evento.dataHora && (
                            <p className="font-sans text-white/50 text-xs mt-1 flex items-center gap-1.5">
                              <svg
                                className="w-3.5 h-3.5 text-brand shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              {formatarDataHora(evento.dataHora)}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 font-sans text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/70 rounded-full px-2.5 py-1">
                          {TIPO_LABEL[evento.tipo] || evento.tipo}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/60">
                        <span className="truncate flex items-center gap-1.5" title={evento.local}>
                          <svg
                            className="w-3.5 h-3.5 text-white/30 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="truncate">{evento.local}</span>
                        </span>
                        <div className="flex items-center gap-3 shrink-0 font-mono">
                          <span className="text-white/40 text-[11px]">
                            {evento.capacidade} lugares
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {formatarMoeda(evento.preco)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
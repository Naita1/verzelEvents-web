import { useState, useEffect } from "react";
import {
  buscarCatalogo,
  criarEvento,
  listarMeusEventos,
} from "../services/organizadorService";

const FORM_VAZIO = {
  titulo: "",
  tipo: "CINEMA",
  dataHora: "",
  local: "",
  capacidade: "",
  preco: "",
};

const TIPO_LABEL = {
  CINEMA: "Cinema",
  SHOW: "Show",
  TEATRO: "Teatro",
};

const inputClass =
  "w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none transition-colors duration-300 focus:border-brand focus:ring-1 focus:ring-brand/30 placeholder:text-white/25";

export default function Organizador() {
  const [query, setQuery] = useState("");
  const [resultadosCatalogo, setResultadosCatalogo] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const [form, setForm] = useState(FORM_VAZIO);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const [meusEventos, setMeusEventos] = useState([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    carregarMeusEventos();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), 20);
    return () => clearTimeout(t);
  }, []);

  function carregarMeusEventos() {
    setCarregandoEventos(true);
    listarMeusEventos()
      .then((dados) => setMeusEventos(Array.isArray(dados) ? dados : dados?.content || []))
      .catch((err) => console.error("Erro ao carregar eventos:", err))
      .finally(() => setCarregandoEventos(false));
  }

  async function handleBuscarCatalogo(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setBuscando(true);
    setErro(null);

    try {
      const resultados = await buscarCatalogo(query);
      const lista = Array.isArray(resultados) ? resultados : resultados?.content || [];
      setResultadosCatalogo(lista);

      if (lista.length === 0) {
        setErro("Nenhum item encontrado no catálogo.");
      }
    } catch (err) {
      setErro(err.response?.data?.message || err.message || "Erro ao buscar no catálogo.");
      setResultadosCatalogo([]);
    } finally {
      setBuscando(false);
    }
  }

  function selecionarDoCatalogo(item) {
    const dataBase = item.dataLancamento
      ? `${item.dataLancamento}T20:00:00`
      : "";
    setForm((prev) => ({
      ...prev,
      titulo: item.titulo,
      tipo: "CINEMA",
      dataHora: dataBase,
    }));
    setResultadosCatalogo([]);
    setQuery("");
  }

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleCriarEvento(e) {
    e.preventDefault();
    setCriando(true);
    setErro(null);
    setSucesso(false);

    try {
      await criarEvento({
        ...form,
        capacidade: Number(form.capacidade),
        preco: Number(form.preco),
      });
      setForm(FORM_VAZIO);
      setSucesso(true);
      carregarMeusEventos();
    } catch (err) {
      setErro(err.response?.data?.message || err.message || "Não foi possível criar o evento.");
    } finally {
      setCriando(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-bg px-6 md:px-16 py-12 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 left-0 w-[560px] h-[560px] rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="relative z-10">
        <div
          className={`transition-all duration-500 ease-out ${
            visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <h1 className="font-display text-4xl md:text-6xl text-white tracking-wide mt-15">
            MEUS <span className="text-brand">EVENTOS</span>
          </h1>
          <div className="h-px w-full max-w-[10rem] bg-gradient-to-r from-brand/60 to-transparent mt-5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <div
            className={`bg-surface border border-white/10 rounded-2xl p-6 md:p-7 transition-all duration-500 ease-out delay-75 ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <h2 className="font-display text-2xl tracking-wide text-white mb-1">
              NOVO EVENTO
            </h2>
            <p className="font-sans text-white/40 text-xs mb-5">
              Busque um filme no catálogo ou preencha os dados manualmente.
            </p>

            <form onSubmit={handleBuscarCatalogo} className="flex gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar filme no catálogo (TMDb)..."
                className={inputClass}
              />
              <button
                type="submit"
                disabled={buscando}
                className="font-sans text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg px-5 transition-colors duration-300 shrink-0"
              >
                {buscando ? "..." : "Buscar"}
              </button>
            </form>

            {resultadosCatalogo.length > 0 && (
              <div className="flex flex-col gap-2 mb-6 max-h-64 overflow-y-auto pr-1">
                {resultadosCatalogo.map((item, index) => (
                  <button
                    key={item.externalId || item.id || index}
                    type="button"
                    onClick={() => selecionarDoCatalogo(item)}
                    style={{ transitionDelay: `${Math.min(index, 6) * 30}ms` }}
                    className="flex items-center gap-3 bg-bg border border-white/10 hover:border-brand/50 hover:bg-white/[0.03] rounded-lg p-2 text-left transition-all duration-300 animate-[fadeIn_0.35s_ease-out_both]"
                  >
                    {item.posterUrl ? (
                      <img
                        src={item.posterUrl}
                        alt={item.titulo}
                        className="w-10 h-14 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded bg-white/5 flex items-center justify-center text-white/20 text-[10px] shrink-0">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="font-sans text-sm text-white">{item.titulo}</p>
                      <p className="font-sans text-xs text-white/40">
                        {item.dataLancamento}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleCriarEvento} className="flex flex-col gap-4">
              <div>
                <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                  Título
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => atualizarCampo("titulo", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                    Tipo
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => atualizarCampo("tipo", e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="CINEMA">Cinema</option>
                    <option value="SHOW">Show</option>
                    <option value="TEATRO">Teatro</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                    Data e hora
                  </label>
                  <input
                    type="datetime-local"
                    value={form.dataHora}
                    onChange={(e) => atualizarCampo("dataHora", e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                  Local
                </label>
                <input
                  type="text"
                  value={form.local}
                  onChange={(e) => atualizarCampo("local", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                    Capacidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.capacidade}
                    onChange={(e) => atualizarCampo("capacidade", e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="flex-1">
                  <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.preco}
                    onChange={(e) => atualizarCampo("preco", e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {erro && (
                <div className="bg-red-950/30 border border-red-500/20 rounded-lg px-4 py-2.5 animate-[fadeIn_0.3s_ease-out_both]">
                  <p className="font-sans text-red-400 text-xs">{erro}</p>
                </div>
              )}
              {sucesso && (
                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-4 py-2.5 animate-[fadeIn_0.3s_ease-out_both]">
                  <p className="font-sans text-emerald-400 text-xs">
                    Evento criado com sucesso!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={criando}
                className="font-sans font-semibold text-xs uppercase tracking-wider bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-full py-3 mt-1 transition-colors duration-300"
              >
                {criando ? "Criando..." : "Criar evento"}
              </button>
            </form>
          </div>

          <div
            className={`bg-surface border border-white/10 rounded-2xl p-6 md:p-7 transition-all duration-500 ease-out delay-150 ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl tracking-wide text-white">
                EVENTOS PUBLICADOS
              </h2>
              {!carregandoEventos && meusEventos.length > 0 && (
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/60 rounded-full px-3 py-1">
                  {meusEventos.length}
                </span>
              )}
            </div>

            {carregandoEventos && (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-bg border border-white/10 rounded-lg p-4"
                  >
                    <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse mb-2" />
                    <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {!carregandoEventos && meusEventos.length === 0 && (
              <div className="flex flex-col items-center text-center py-12">
                <div className="w-12 h-12 rounded-full bg-[#a11b3e]/15 border border-[#a11b3e]/40 flex items-center justify-center mb-4">
                  <span className="text-lg">🎬</span>
                </div>
                <p className="font-sans text-white/50 text-sm">
                  Você ainda não criou nenhum evento.
                </p>
              </div>
            )}

            <ul className="flex flex-col gap-3">
              {meusEventos.map((evento, index) => (
                <li
                  key={evento.id || index}
                  style={{ transitionDelay: visivel ? `${Math.min(index, 8) * 40}ms` : "0ms" }}
                  className={`bg-bg border border-white/10 rounded-lg p-4 transition-all duration-500 ease-out hover:border-white/20 hover:-translate-y-0.5 ${
                    visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-sans text-white font-semibold text-sm">
                      {evento.titulo}
                    </p>
                    <span className="shrink-0 font-sans text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/50 rounded-full px-2.5 py-1">
                      {TIPO_LABEL[evento.tipo] || evento.tipo}
                    </span>
                  </div>
                  <p className="font-sans text-white/40 text-xs mt-1.5">
                    {evento.local} · {evento.capacidade} lugares · R${" "}
                    {(Number(evento.preco) || 0).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
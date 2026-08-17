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

  useEffect(() => {
    carregarMeusEventos();
  }, []);

  function carregarMeusEventos() {
    setCarregandoEventos(true);
    listarMeusEventos()
      .then(setMeusEventos)
      .finally(() => setCarregandoEventos(false));
  }

  async function handleBuscarCatalogo(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setBuscando(true);
    try {
      const resultados = await buscarCatalogo(query);
      setResultadosCatalogo(resultados);
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
      setErro(err.message || "Não foi possível criar o evento.");
    } finally {
      setCriando(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg px-6 md:px-16 py-12">
      <span className="font-sans text-white/40 text-sm tracking-widest uppercase">
        Área do Organizador
      </span>
      <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide mt-2">
        MEUS <span className="text-brand">EVENTOS</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <h2 className="font-display text-2xl tracking-wide text-white mb-4">
            NOVO EVENTO
          </h2>

          <form onSubmit={handleBuscarCatalogo} className="flex gap-2 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar filme no catálogo (TMDb)..."
              className="flex-1 bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans text-sm outline-none focus:border-brand transition-colors"
            />
            <button
              type="submit"
              disabled={buscando}
              className="font-sans text-sm font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg px-4 transition-colors"
            >
              {buscando ? "..." : "Buscar"}
            </button>
          </form>

          {resultadosCatalogo.length > 0 && (
            <div className="flex flex-col gap-2 mb-6 max-h-64 overflow-y-auto">
              {resultadosCatalogo.map((item) => (
                <button
                  key={item.externalId}
                  onClick={() => selecionarDoCatalogo(item)}
                  className="flex items-center gap-3 bg-bg border border-white/10 hover:border-brand/50 rounded-lg p-2 text-left transition-colors"
                >
                  {item.posterUrl && (
                    <img
                      src={item.posterUrl}
                      alt={item.titulo}
                      className="w-10 h-14 object-cover rounded"
                    />
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

          <form onSubmit={handleCriarEvento} className="flex flex-col gap-3">
            <div>
              <label className="font-sans text-xs text-white/60 block mb-1">
                Título
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => atualizarCampo("titulo", e.target.value)}
                required
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans text-sm outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-sans text-xs text-white/60 block mb-1">
                  Tipo
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => atualizarCampo("tipo", e.target.value)}
                  className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans text-sm outline-none focus:border-brand transition-colors"
                >
                  <option value="CINEMA">Cinema</option>
                  <option value="SHOW">Show</option>
                  <option value="TEATRO">Teatro</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="font-sans text-xs text-white/60 block mb-1">
                  Data e hora
                </label>
                <input
                  type="datetime-local"
                  value={form.dataHora}
                  onChange={(e) => atualizarCampo("dataHora", e.target.value)}
                  required
                  className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans text-sm outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-sans text-xs text-white/60 block mb-1">
                Local
              </label>
              <input
                type="text"
                value={form.local}
                onChange={(e) => atualizarCampo("local", e.target.value)}
                required
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans text-sm outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-sans text-xs text-white/60 block mb-1">
                  Capacidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.capacidade}
                  onChange={(e) => atualizarCampo("capacidade", e.target.value)}
                  required
                  className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans text-sm outline-none focus:border-brand transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="font-sans text-xs text-white/60 block mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) => atualizarCampo("preco", e.target.value)}
                  required
                  className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans text-sm outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>

            {erro && <p className="font-sans text-red-400 text-sm">{erro}</p>}
            {sucesso && (
              <p className="font-sans text-emerald-400 text-sm">
                Evento criado com sucesso!
              </p>
            )}

            <button
              type="submit"
              disabled={criando}
              className="font-sans font-semibold bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-lg py-2 mt-1 transition-colors"
            >
              {criando ? "Criando..." : "Criar evento"}
            </button>
          </form>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <h2 className="font-display text-2xl tracking-wide text-white mb-4">
            EVENTOS PUBLICADOS
          </h2>

          {carregandoEventos && (
            <p className="font-sans text-white/40 text-sm">Carregando...</p>
          )}
          {!carregandoEventos && meusEventos.length === 0 && (
            <p className="font-sans text-white/40 text-sm">
              Você ainda não criou nenhum evento.
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {meusEventos.map((evento) => (
              <li
                key={evento.id}
                className="bg-bg border border-white/10 rounded-lg p-4"
              >
                <p className="font-sans text-white font-semibold">
                  {evento.titulo}
                </p>
                <p className="font-sans text-white/50 text-sm">
                  {evento.local} · {evento.capacidade} lugares · R${" "}
                  {evento.preco.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
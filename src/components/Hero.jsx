import { useState, useRef, useEffect } from "react";

export default function Hero({
  busca,
  setBusca,
  tipos,
  tipoFiltro,
  setTipoFiltro,
}) {
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const filtroRef = useRef(null);

  function alternarDropdown() {
    setDropdownAberto((v) => !v);
  }

  function selecionarTipo(tipo) {
    setTipoFiltro(tipo);
    setDropdownAberto(false);
  }

  function limparBusca() {
    setBusca("");
  }

  useEffect(() => {
    if (!dropdownAberto) return;

    function handleCliqueFora(e) {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setDropdownAberto(false);
      }
    }

    document.addEventListener("mousedown", handleCliqueFora);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleCliqueFora);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownAberto]);

  return (
    <div className="relative max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 z-20">
      <div className="w-full md:max-w-lg">
        <span className="font-sans text-xs font-bold text-[#e2e8f0] uppercase tracking-[0.2em] block mb-3 opacity-90">
          Descubra experiências únicas
        </span>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-wide leading-[1.05]">
          O que você <br /> quer viver hoje?
        </h1>
      </div>

      <div className="relative z-30 w-full md:w-96 flex flex-col gap-3.5">
        {/* Campo de Busca com Glassmorphism */}
        <div className="flex items-center bg-[#18050a]/80 hover:bg-[#20070e]/90 backdrop-blur-xl border border-white/15 focus-within:border-brand/70 focus-within:ring-2 focus-within:ring-brand/30 rounded-full pl-5 pr-2 py-2 shadow-2xl transition-all duration-200">
          <span className="text-white/40 mr-2.5 shrink-0" aria-hidden="true">
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          </span>

          <label htmlFor="busca-eventos" className="sr-only">
            Buscar por evento ou local
          </label>
          <input
            id="busca-eventos"
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por evento ou local..."
            className="flex-1 bg-transparent font-sans text-sm text-white placeholder-white/40 outline-none min-w-0"
          />

          {busca && (
            <button
              type="button"
              onClick={limparBusca}
              aria-label="Limpar campo de busca"
              className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown de Filtro Acessível */}
        <div className="relative" ref={filtroRef}>
          <button
            type="button"
            onClick={alternarDropdown}
            aria-haspopup="listbox"
            aria-expanded={dropdownAberto}
            aria-label={`Filtrar por categoria: ${tipoFiltro === "TODOS" ? "Todos os tipos" : tipoFiltro}`}
            className="w-full flex items-center justify-between bg-[#18050a]/80 hover:bg-[#20070e]/90 backdrop-blur-xl border border-white/15 hover:border-white/25 rounded-full px-5 py-3 font-sans text-sm text-white/90 font-medium shadow-2xl transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex items-center gap-2">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Tipo:</span>
              <span className="text-white font-semibold">{tipoFiltro === "TODOS" ? "Todos" : tipoFiltro}</span>
            </span>
            <svg
              className={`w-4 h-4 text-brand transition-transform duration-300 ease-in-out ${
                dropdownAberto ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownAberto && (
            <div
              role="listbox"
              aria-label="Selecione um tipo de evento"
              className="absolute top-full left-0 w-full mt-2 z-50 bg-[#150409]/95 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 py-1 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {tipos.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  role="option"
                  aria-selected={tipoFiltro === tipo}
                  onClick={() => selecionarTipo(tipo)}
                  className={`w-full text-left px-5 py-3 font-sans text-sm font-medium flex items-center justify-between transition-colors duration-150 focus-visible:outline-none focus-visible:bg-white/10 ${
                    tipoFiltro === tipo
                      ? "bg-brand/20 text-white font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tipo === "TODOS" ? "Todos" : tipo}
                  {tipoFiltro === tipo && (
                    <span className="w-2 h-2 rounded-full bg-brand" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
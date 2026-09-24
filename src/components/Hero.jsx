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
    <div className="relative max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 z-20">
      <div className="w-full lg:max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 mb-4 backdrop-blur-md shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="font-sans text-[11px] font-bold text-brand uppercase tracking-[0.22em]">
            Descubra experiências únicas
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-wide leading-[1.04]">
          O que você quer <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand via-[#e63968] to-brand">
            viver hoje?
          </span>
        </h1>
      </div>

      <div className="relative z-30 w-full lg:w-105 flex flex-col gap-3">
        <div className="group relative flex items-center bg-[#140509]/80 hover:bg-[#1a070d]/90 backdrop-blur-xl border border-white/15 focus-within:border-brand/70 focus-within:ring-2 focus-within:ring-brand/40 focus-within:shadow-[0_0_24px_rgba(161,27,62,0.25)] rounded-2xl px-4 py-2.5 shadow-2xl transition-all duration-200">
          <span className="text-white/40 group-focus-within:text-brand mr-3 shrink-0 transition-colors" aria-hidden="true">
            <svg className="w-4 h-4 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7.5" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" strokeLinejoin="round" />
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
            className="flex-1 bg-transparent font-sans text-sm text-white placeholder-white/40 outline-none min-w-0 tracking-wide"
          />

          {busca && (
            <button
              type="button"
              onClick={limparBusca}
              aria-label="Limpar campo de busca"
              className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="relative" ref={filtroRef}>
          <button
            type="button"
            onClick={alternarDropdown}
            aria-haspopup="listbox"
            aria-expanded={dropdownAberto}
            aria-label={`Filtrar por categoria: ${tipoFiltro === "TODOS" ? "Todos os tipos" : tipoFiltro}`}
            className="w-full flex items-center justify-between bg-[#140509]/80 hover:bg-[#1a070d]/90 backdrop-blur-xl border border-white/15 hover:border-white/30 rounded-2xl px-5 py-3 font-sans text-sm text-white/90 font-medium shadow-2xl transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex items-center gap-2.5">
              <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Categoria:</span>
              <span className="text-white font-semibold capitalize">
                {tipoFiltro === "TODOS" ? "Todas" : tipoFiltro.toLowerCase()}
              </span>
            </span>
            <svg
              className={`w-4 h-4 text-brand transition-transform duration-300 ease-in-out ${
                dropdownAberto ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownAberto && (
            <div
              role="listbox"
              aria-label="Selecione um tipo de evento"
              className="absolute top-full left-0 w-full mt-2 z-50 max-h-64 overflow-y-auto bg-[#120408]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl shadow-black/90 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-thin scrollbar-thumb-white/10"
            >
              {tipos.map((tipo) => {
                const isSelecionado = tipoFiltro === tipo;
                return (
                  <button
                    key={tipo}
                    type="button"
                    role="option"
                    aria-selected={isSelecionado}
                    onClick={() => selecionarTipo(tipo)}
                    className={`w-full text-left px-4 py-2.5 font-sans text-sm font-medium flex items-center justify-between transition-all duration-150 focus-visible:outline-none focus-visible:bg-white/10 capitalize ${
                      isSelecionado
                        ? "bg-brand/20 text-white font-semibold border-l-2 border-brand pl-3.5"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{tipo === "TODOS" ? "Todas as categorias" : tipo.toLowerCase()}</span>
                    {isSelecionado && (
                      <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
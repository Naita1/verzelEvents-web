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

  useEffect(() => {
    if (!dropdownAberto) return;

    function handleCliqueFora(e) {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    }

    document.addEventListener("mousedown", handleCliqueFora);
    return () => {
      document.removeEventListener("mousedown", handleCliqueFora);
    };
  }, [dropdownAberto]);

  return (
    <div className="relative max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 z-20">
      <div className="w-full md:max-w-lg">
        <span className="font-sans text-xs font-bold text-[#e2e8f0] uppercase tracking-[0.2em] block mb-3 opacity-90">
          Encontre seu próximo evento
        </span>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-wide leading-[1.05]">
          O que você <br /> quer viver hoje?
        </h1>
      </div>

      <div className="relative z-30 w-full md:w-85 flex flex-col gap-3.5">
        <div className="flex items-center bg-[#e2e8f0] border border-white/20 rounded-full pl-5 pr-1.5 py-1.5 shadow-xl transition-all duration-200 hover:bg-[#edf2f7]">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por evento ou local..."
            className="flex-1 bg-transparent font-sans text-sm text-[#1e293b] placeholder-[#64748b] outline-none min-w-0"
          />
          <button
            type="button"
            aria-label="Buscar"
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-[#581c25] hover:bg-[#43121a] text-white font-bold transition-transform duration-200 active:scale-95 shadow-md"
          >
            →
          </button>
        </div>

        <div className="relative" ref={filtroRef}>
          <button
            type="button"
            onClick={alternarDropdown}
            className="w-full flex items-center justify-between bg-[#e2e8f0] hover:bg-[#edf2f7] border border-white/20 rounded-full px-5 py-3 font-sans text-sm text-[#1e293b] font-medium shadow-xl transition-all duration-200 active:scale-[0.99]"
          >
            <span>{tipoFiltro === "TODOS" ? "Todos" : tipoFiltro}</span>
            <span
              className={`text-[#581c25] text-xs font-bold transition-transform duration-300 ease-in-out ${
                dropdownAberto ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {dropdownAberto && (
            <div className="absolute top-full left-0 w-full mt-2 z-50 bg-[#e2e8f0] border border-[#cbd5e1] rounded-2xl overflow-hidden shadow-2xl transform-gpu transition-all duration-200 animate-in fade-in slide-in-from-top-2">
              {tipos.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => selecionarTipo(tipo)}
                  className="w-full text-left px-5 py-3 font-sans text-sm text-[#334155] font-medium hover:bg-[#581c25] hover:text-white transition-colors duration-150"
                >
                  {tipo === "TODOS" ? "Todos" : tipo}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { memo } from "react";

function isOcupado(status) {
  return status === "OCUPADO" || status === "RESERVADO" || status === "VENDIDO";
}

function formatarStatusTexto(status, selecionado, bloqueado) {
  if (selecionado) return "Selecionado";
  if (isOcupado(status)) return "Indisponível";
  if (bloqueado) return "Limite de assentos atingido";
  return "Disponível";
}

const SeatButton = memo(function SeatButton({
  id,
  codigo,
  status,
  estaSelecionado,
  limiteAtingido,
  onToggle,
}) {
  const ocupado = isOcupado(status);
  const bloqueado = !estaSelecionado && limiteAtingido;
  const rotuloAssento = codigo || id;
  const statusDescricao = formatarStatusTexto(status, estaSelecionado, bloqueado);

  let classesEstilo;
  if (estaSelecionado) {
    classesEstilo =
      "bg-brand border-white/60 text-white font-bold ring-2 ring-brand/50 shadow-md shadow-brand/40 scale-105 z-10 cursor-pointer";
  } else if (ocupado) {
    classesEstilo =
      "bg-white/[0.03] border-white/5 text-white/20 cursor-not-allowed opacity-50";
  } else if (bloqueado) {
    classesEstilo =
      "bg-white/[0.04] border-white/5 text-white/20 cursor-not-allowed opacity-35";
  } else {
    classesEstilo =
      "bg-white/10 hover:bg-white/25 border-white/15 hover:border-white/40 text-white/90 hover:text-white hover:scale-110 active:scale-95 cursor-pointer shadow-sm";
  }

  return (
    <button
      type="button"
      disabled={ocupado || bloqueado}
      onClick={() => onToggle(id)}
      aria-pressed={estaSelecionado}
      aria-label={`Assento ${rotuloAssento} - ${statusDescricao}`}
      title={`Assento ${rotuloAssento} (${statusDescricao})`}
      className={`w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-t-lg rounded-b-sm border text-[10px] sm:text-[11px] font-sans font-medium transition-all duration-200 transform-gpu flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black ${classesEstilo}`}
    >
      {rotuloAssento}
    </button>
  );
});

function LegendaMapa() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 text-xs font-sans text-white/60 border-t border-white/10 mt-6 select-none">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-t-md rounded-b-xs bg-white/10 border border-white/20 inline-block shadow-xs" />
        <span>Disponível</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-t-md rounded-b-xs bg-brand border border-white/60 ring-2 ring-brand/40 shadow-xs shadow-brand inline-block" />
        <span className="text-white font-medium">Selecionado</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-t-md rounded-b-xs bg-white/4 border border-white/5 opacity-50 inline-block" />
        <span>Indisponível</span>
      </div>
    </div>
  );
}

function PalcoIndicador() {
  return (
    <div className="w-full flex flex-col items-center mb-8 pointer-events-none select-none">
      <div className="relative w-full max-w-lg flex flex-col items-center">
        <div
          className="w-full h-8 border-t-2 border-brand/60 rounded-t-[100%] opacity-80"
          style={{
            boxShadow: "0 -8px 24px -4px rgba(161, 27, 62, 0.45)",
          }}
        />
        <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-white/60 -mt-2 bg-[#120408] px-4 py-0.5 rounded-full border border-white/10">
          PALCO / TELA
        </span>
      </div>
    </div>
  );
}

function GridSimples({ assentos, selecionados, onToggle, limiteAtingido }) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5 justify-items-center py-4">
      {assentos.map((assento) => (
        <SeatButton
          key={assento.id}
          id={assento.id}
          codigo={assento.codigo}
          status={assento.status}
          estaSelecionado={selecionados.includes(assento.id)}
          limiteAtingido={limiteAtingido}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function RowsAisle({ assentos, selecionados, onToggle, layout, limiteAtingido }) {
  const { rowLabels, groupSizes } = layout;
  const porFileira = groupSizes.reduce((a, b) => a + b, 0);

  return (
    <div className="py-2 space-y-2.5 overflow-x-auto flex flex-col items-center max-w-full px-2">
      {rowLabels.map((rowLabel, rowIndex) => {
        const cursor = rowIndex * porFileira;
        const assentosDaFileira = assentos.slice(cursor, cursor + porFileira);

        let posicaoNaFileira = 0;

        return (
          <div
            key={rowLabel}
            className="flex items-center justify-center gap-2 sm:gap-3.5 min-w-max select-none"
          >
            <span className="w-5 text-center font-bold font-mono text-[11px] text-white/40 uppercase">
              {rowLabel}
            </span>

            {groupSizes.map((tamanhoGrupo, grupoIdx) => {
              const inicioGrupo = posicaoNaFileira;
              posicaoNaFileira += tamanhoGrupo;
              const assentosDoGrupo = assentosDaFileira.slice(inicioGrupo, inicioGrupo + tamanhoGrupo);
              const isGrupoCentral = grupoIdx === 1;

              return (
                <div
                  key={grupoIdx}
                  className={`flex gap-1.5 sm:gap-2 ${
                    isGrupoCentral ? "mx-3 sm:mx-5 relative after:content-[''] after:absolute after:-left-2 sm:after:-left-3.5 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-4 after:bg-white/10" : ""
                  }`}
                >
                  {Array.from({ length: tamanhoGrupo }).map((_, i) => {
                    const assento = assentosDoGrupo[i];

                    if (!assento) {
                      return (
                        <span
                          key={`vazio-${rowLabel}-${grupoIdx}-${i}`}
                          className="w-7 h-7 sm:w-8.5 sm:h-8.5 opacity-0 pointer-events-none"
                        />
                      );
                    }

                    return (
                      <SeatButton
                        key={assento.id}
                        id={assento.id}
                        codigo={assento.codigo}
                        status={assento.status}
                        estaSelecionado={selecionados.includes(assento.id)}
                        limiteAtingido={limiteAtingido}
                        onToggle={onToggle}
                      />
                    );
                  })}
                </div>
              );
            })}

            <span className="w-5 text-center font-bold font-mono text-[11px] text-white/40 uppercase">
              {rowLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default memo(function SeatMap({ assentos, selecionados, onToggle, layout, limiteAtingido = false }) {
  const isRowsAisle = layout?.type === "rows-aisle";

  return (
    <div className="w-full bg-[#140509]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-7 md:p-8 shadow-2xl relative">
      <PalcoIndicador />

      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isRowsAisle ? (
          <RowsAisle
            assentos={assentos}
            selecionados={selecionados}
            onToggle={onToggle}
            layout={layout}
            limiteAtingido={limiteAtingido}
          />
        ) : (
          <GridSimples
            assentos={assentos}
            selecionados={selecionados}
            onToggle={onToggle}
            limiteAtingido={limiteAtingido}
          />
        )}
      </div>

      <LegendaMapa />
    </div>
  );
});
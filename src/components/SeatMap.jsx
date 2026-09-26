import { memo, useCallback } from "react";

function isOcupado(status) {
  return status === "OCUPADO" || status === "RESERVADO" || status === "VENDIDO";
}

function formatarStatusTexto(status, selecionado, bloqueado) {
  if (selecionado) return "Selecionado";
  if (isOcupado(status)) return "Ocupado";
  if (bloqueado) return "Limite de assentos atingido";
  return "Livre";
}

const SeatButton = memo(function SeatButton({ id, codigo, status, estaSelecionado, limiteAtingido }) {
  const ocupado = isOcupado(status);
  const bloqueado = !estaSelecionado && limiteAtingido;
  const rotuloAssento = codigo || id;
  const statusDescricao = formatarStatusTexto(status, estaSelecionado, bloqueado);

  let classesEstilo;
  if (estaSelecionado) {
    classesEstilo = "bg-brand border-white/60 text-white font-bold ring-2 ring-brand/50 z-10 cursor-pointer";
  } else if (ocupado) {
    classesEstilo = "bg-white/[0.03] border-white/5 text-white/20 cursor-not-allowed opacity-50";
  } else if (bloqueado) {
    classesEstilo = "bg-white/[0.04] border-white/5 text-white/20 cursor-not-allowed opacity-35";
  } else {
    classesEstilo =
      "bg-white/10 hover:bg-white/25 border-white/15 hover:border-white/40 text-white/90 hover:text-white active:scale-95 cursor-pointer shadow-sm";
  }

  return (
    <button
      type="button"
      data-seat-id={id}
      disabled={ocupado || bloqueado}
      aria-pressed={estaSelecionado}
      aria-label={`Assento ${rotuloAssento} - ${statusDescricao}`}
      title={`Assento ${rotuloAssento} (${statusDescricao})`}
      style={{ transition: "transform 0.1s ease, background-color 0.1s ease" }}
      className={`w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-md border text-[10px] sm:text-[11px] font-sans font-medium flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black ${classesEstilo}`}
    >
      {rotuloAssento}
    </button>
  );
});

function LegendaMapa() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 text-xs font-sans text-white/60 border-t border-white/10 mt-5 select-none">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-md bg-white/10 border border-white/20 inline-block" />
        <span>Livre</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-md bg-white/4 border border-white/5 opacity-50 inline-block" />
        <span>Ocupado</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-md bg-brand border border-white/60 ring-2 ring-brand/40 inline-block" />
        <span className="text-white font-medium">Selecionado</span>
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
          style={{ boxShadow: "0 -8px 24px -4px rgba(161, 27, 62, 0.45)" }}
        />
        <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-white/60 -mt-2 bg-[#120408] px-4 py-0.5 rounded-full border border-white/10">
          PALCO / TELA
        </span>
      </div>
    </div>
  );
}

function RowLetter({ letra }) {
  return (
    <span className="w-5 text-center font-bold font-mono text-[11px] text-white/40 uppercase">
      {letra}
    </span>
  );
}

function SeatsGrid({ assentos, selecionados, layout, limiteAtingido }) {
  const { rowLabels, groupSizes } = layout;
  const porFileira = groupSizes.reduce((a, b) => a + b, 0);
  const nomesBloco = ["Esquerdo", "Central", "Direito"];

  return (
    <div className="flex flex-col items-center gap-2.5 py-2">
      {rowLabels.map((rowLabel, rowIndex) => {
        const cursor = rowIndex * porFileira;
        const assentosDaFileira = assentos.slice(cursor, cursor + porFileira);
        let posicaoNaFileira = 0;

        return (
          <div key={rowLabel} className="flex items-center justify-center gap-3 sm:gap-4 min-w-max select-none">
            <RowLetter letra={rowLabel} />

            {groupSizes.map((tamanhoGrupo, grupoIdx) => {
              const inicioGrupo = posicaoNaFileira;
              posicaoNaFileira += tamanhoGrupo;
              const assentosDoGrupo = assentosDaFileira.slice(inicioGrupo, inicioGrupo + tamanhoGrupo);
              const isGrupoCentral = grupoIdx === 1;

              return (
                <div
                  key={grupoIdx}
                  role="group"
                  aria-label={`Bloco ${nomesBloco[grupoIdx] ?? grupoIdx + 1}`}
                  className={`grid gap-1.5 sm:gap-2 ${isGrupoCentral ? "mx-3 sm:mx-5" : ""}`}
                  style={{ gridTemplateColumns: `repeat(${tamanhoGrupo}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: tamanhoGrupo }).map((_, i) => {
                    const assento = assentosDoGrupo[i];
                    if (!assento) {
                      return <span key={`vazio-${rowLabel}-${grupoIdx}-${i}`} className="w-7 h-7 sm:w-8.5 sm:h-8.5" />;
                    }
                    return (
                      <SeatButton
                        key={assento.id}
                        id={assento.id}
                        codigo={assento.codigo}
                        status={assento.status}
                        estaSelecionado={selecionados.includes(assento.id)}
                        limiteAtingido={limiteAtingido}
                      />
                    );
                  })}
                </div>
              );
            })}

            <RowLetter letra={rowLabel} />
          </div>
        );
      })}
    </div>
  );
}

export default memo(function SeatMap({ assentos, selecionados, onToggle, layout, limiteAtingido = false }) {
  const handleContainerClick = useCallback(
    (event) => {
      const botao = event.target.closest("button[data-seat-id]");
      if (!botao || botao.disabled) return;
      onToggle(botao.dataset.seatId);
    },
    [onToggle]
  );

  return (
    <div className="w-full">
      <PalcoIndicador />

      <div
        className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        onClick={handleContainerClick}
      >
        <SeatsGrid
          assentos={assentos}
          selecionados={selecionados}
          layout={layout}
          limiteAtingido={limiteAtingido}
        />
      </div>

      <LegendaMapa />
    </div>
  );
});
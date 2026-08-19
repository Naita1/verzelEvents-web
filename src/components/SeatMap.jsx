import { memo } from "react";

const STATUS_STYLE = {
  LIVRE: "bg-surface border-white/20 hover:border-brand text-white/70 cursor-pointer",
  RESERVADO: "bg-yellow-500/20 border-yellow-500/40 text-yellow-500/60 cursor-not-allowed",
  VENDIDO: "bg-white/5 border-white/5 text-white/20 cursor-not-allowed",
};

const SELECIONADO_STYLE = "bg-brand border-brand text-white cursor-pointer";

const ROWS_AISLE_STATUS_STYLE = {
  LIVRE: "bg-white/20 hover:bg-white/40 text-white cursor-pointer",
  RESERVADO: "bg-red-950/80 border border-red-800/40 text-white/30 cursor-not-allowed opacity-60",
  VENDIDO: "bg-red-950/80 border border-red-800/40 text-white/30 cursor-not-allowed opacity-60",
  OCUPADO: "bg-red-950/80 border border-red-800/40 text-white/30 cursor-not-allowed opacity-60",
};
const ROWS_AISLE_SELECIONADO = "bg-[#a11b3e] border border-white/60 text-white font-bold shadow-lg shadow-[#a11b3e]/50 cursor-pointer scale-105";
const ROWS_AISLE_BLOQUEADO = "bg-white/5 cursor-not-allowed opacity-30 text-white/20";

function isOcupado(status) {
  return status === "OCUPADO" || status === "RESERVADO" || status === "VENDIDO";
}

const SeatButton = memo(function SeatButton({
  id,
  codigo,
  status,
  estaSelecionado,
  limiteAtingido,
  onToggle,
  isRowsAisle,
}) {
  const ocupado = isOcupado(status);
  const bloqueado = !estaSelecionado && limiteAtingido;

  if (isRowsAisle) {
    const estilo = estaSelecionado
      ? ROWS_AISLE_SELECIONADO
      : ocupado
      ? ROWS_AISLE_STATUS_STYLE[status] || ROWS_AISLE_STATUS_STYLE.OCUPADO
      : bloqueado
      ? ROWS_AISLE_BLOQUEADO
      : ROWS_AISLE_STATUS_STYLE.LIVRE;

    return (
      <button
        type="button"
        onClick={() => onToggle(id)}
        disabled={ocupado || bloqueado}
        title={`${codigo || id} · ${status}`}
        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-150 flex items-center justify-center ${estilo}`}
      >
        {codigo || id}
      </button>
    );
  }

  const estaLivre = status === "LIVRE";
  const estilo = estaSelecionado
    ? SELECIONADO_STYLE
    : STATUS_STYLE[status] || STATUS_STYLE.VENDIDO;

  return (
    <button
      disabled={!estaLivre && !estaSelecionado}
      onClick={() => onToggle(id)}
      className={`aspect-square rounded-md border font-sans text-xs font-semibold transition-colors ${estilo}`}
      title={`${codigo || id} · ${status}`}
    >
      {codigo || id}
    </button>
  );
});

function GridSimples({ assentos, selecionados, onToggle }) {
  return (
    <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
      {assentos.map((assento) => (
        <SeatButton
          key={assento.id}
          id={assento.id}
          codigo={assento.codigo}
          status={assento.status}
          estaSelecionado={selecionados.includes(assento.id)}
          limiteAtingido={false}
          onToggle={onToggle}
          isRowsAisle={false}
        />
      ))}
    </div>
  );
}

function RowsAisle({ assentos, selecionados, onToggle, layout, limiteAtingido }) {
  const { rowLabels, groupSizes } = layout;
  const porFileira = groupSizes.reduce((a, b) => a + b, 0);

  let cursor = 0;

  return (
    <div className="py-4 space-y-2.5 overflow-x-auto flex flex-col items-center">
      {rowLabels.map((rowLabel) => {
        const assentosDaFileira = assentos.slice(cursor, cursor + porFileira);
        cursor += porFileira;

        let posicaoNaFileira = 0;

        return (
          <div key={rowLabel} className="flex items-center justify-center gap-2 sm:gap-4 text-[10px] text-white/40 min-w-max">
            <span className="w-4 text-center font-bold font-mono uppercase">{rowLabel}</span>

            {groupSizes.map((tamanhoGrupo, grupoIdx) => {
              const inicioGrupo = posicaoNaFileira;
              posicaoNaFileira += tamanhoGrupo;
              const assentosDoGrupo = assentosDaFileira.slice(inicioGrupo, inicioGrupo + tamanhoGrupo);
              const isGrupoCentral = grupoIdx === 1;

              return (
                <div key={grupoIdx} className={`flex gap-1.5 ${isGrupoCentral ? "mx-2 sm:mx-4" : ""}`}>
                  {Array.from({ length: tamanhoGrupo }).map((_, i) => {
                    const assento = assentosDoGrupo[i];

                    if (!assento) {
                      return <span key={`vazio-${rowLabel}-${grupoIdx}-${i}`} className="w-7 h-7 sm:w-9 sm:h-9" />;
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
                        isRowsAisle={true}
                      />
                    );
                  })}
                </div>
              );
            })}

            <span className="w-4 text-center font-bold font-mono uppercase">{rowLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

export default memo(function SeatMap({ assentos, selecionados, onToggle, layout, limiteAtingido = false }) {
  if (layout?.type === "rows-aisle") {
    return (
      <RowsAisle
        assentos={assentos}
        selecionados={selecionados}
        onToggle={onToggle}
        layout={layout}
        limiteAtingido={limiteAtingido}
      />
    );
  }

  return <GridSimples assentos={assentos} selecionados={selecionados} onToggle={onToggle} />;
});
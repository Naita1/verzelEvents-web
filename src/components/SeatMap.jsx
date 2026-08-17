const STATUS_STYLE = {
  LIVRE: "bg-surface border-white/20 hover:border-brand text-white/70 cursor-pointer",
  RESERVADO: "bg-yellow-500/20 border-yellow-500/40 text-yellow-500/60 cursor-not-allowed",
  VENDIDO: "bg-white/5 border-white/5 text-white/20 cursor-not-allowed",
};

const SELECIONADO_STYLE = "bg-brand border-brand text-white cursor-pointer";

export default function SeatMap({ assentos, selecionados, onToggle }) {
  return (
    <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
      {assentos.map((assento) => {
        const estaSelecionado = selecionados.includes(assento.id);
        const estaLivre = assento.status === "LIVRE";

        const estilo = estaSelecionado
          ? SELECIONADO_STYLE
          : STATUS_STYLE[assento.status] || STATUS_STYLE.VENDIDO;

        return (
          <button
            key={assento.id}
            disabled={!estaLivre && !estaSelecionado}
            onClick={() => onToggle(assento.id)}
            className={`aspect-square rounded-md border font-sans text-xs font-semibold transition-colors ${estilo}`}
            title={`${assento.codigo} · ${assento.status}`}
          >
            {assento.codigo}
          </button>
        );
      })}
    </div>
  );
}
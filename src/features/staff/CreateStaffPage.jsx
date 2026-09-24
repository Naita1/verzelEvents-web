import { useState } from "react";
import { Link } from "react-router-dom";
import { createStaff } from "./api";
import backgroundImg from "../../assets/background2.jpg";

const ROLES = [
  {
    value: "PORTARIA",
    label: "Porteiro",
    description: "Acessa a validação de ingressos na entrada dos eventos.",
    badge: "Validação & Check-in",
  },
  {
    value: "ORGANIZADOR",
    label: "Organizador",
    description:
      "Acesso total: cria eventos, gerencia ingressos e pode criar outras contas de equipe.",
    badge: "Acesso Total",
  },
];

export default function CreateStaffPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("PORTARIA");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};

    if (nome.trim().length < 3) {
      errs.nome = "Informe o nome completo.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errs.email = "Informe um e-mail válido.";
    }

    if (senha.length < 6) {
      errs.senha = "A senha precisa ter pelo menos 6 caracteres.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function resetForm() {
    setNome("");
    setEmail("");
    setSenha("");
    setRole("PORTARIA");
    setFieldErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      await createStaff({ nome, email, senha, role });
      setSuccess({
        nome,
        role,
      });
    } catch (err) {
      setError(err.message || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen pt-12 md:pt-20 pb-16 px-6 md:px-12 lg:px-16 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={backgroundImg}
          alt="Background Eventos"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#0b0306]/95 via-[#0b0306]/90 to-[#0b0306]" />
        <div
          className="pointer-events-none absolute -top-40 right-0 w-140 h-140 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 mb-3 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="font-sans text-[11px] font-bold text-brand uppercase tracking-[0.2em]">
              Gestão de Equipe
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
            Nova Conta de Staff
          </h1>
          <p className="font-sans text-xs sm:text-sm text-white/55 mt-1 max-w-lg">
            Cadastre novos membros da equipe e configure credenciais de acesso seguro à plataforma.
          </p>
        </div>

        {success ? (
          <div className="bg-[#140509]/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-white/15 text-center shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 text-emerald-400 shadow-inner">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">
              Conta Criada com Sucesso
            </h2>
            <p className="font-sans text-sm text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              <strong className="text-white font-semibold">{success.nome}</strong> foi registrado como{" "}
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold uppercase tracking-wider mx-1">
                {success.role === "PORTARIA" ? "Porteiro" : "Organizador"}
              </span>
              . As credenciais de login já estão liberadas para acesso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSuccess(null);
                }}
                className="font-sans font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand hover:brightness-110 text-white rounded-full py-3.5 px-8 transition-all duration-300 shadow-lg shadow-brand/30 active:scale-95 cursor-pointer"
              >
                Criar outra conta
              </button>
              <Link
                to="/organizador"
                className="font-sans font-bold text-xs uppercase tracking-wider border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full py-3.5 px-8 transition-all duration-300 text-center"
              >
                Voltar para Meus Eventos
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#140509]/85 backdrop-blur-2xl rounded-3xl p-7 sm:p-10 border border-white/15 shadow-2xl relative">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <span className="block font-sans text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3">
                  Tipo de Acesso
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ROLES.map((r) => {
                    const selecionado = role === r.value;
                    return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      aria-pressed={role === r.value}
                        className={`text-left rounded-2xl p-4.5 border transition-all duration-200 cursor-pointer ${
                          selecionado
                            ? "bg-brand/20 border-brand ring-2 ring-brand/40 shadow-lg shadow-brand/15"
                            : "bg-white/3 border-white/10 hover:border-white/25 hover:bg-white/6"
                      }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-sans text-sm font-bold uppercase tracking-wider ${
                                selecionado ? "text-white" : "text-white/80"
                              }`}
                            >
                              {r.label}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                              {r.badge}
                            </span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              selecionado
                                ? "border-brand bg-brand"
                                : "border-white/30 bg-transparent"
                            }`}
                          >
                            {selecionado && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <span className="font-sans text-xs text-white/55 leading-relaxed block">
                        {r.description}
                      </span>
                    </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="staff-nome"
                  className="block font-sans text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2"
                >
                  Nome completo
                </label>
                <div
                  className={`relative flex items-center rounded-2xl bg-white/4 border px-4 py-3 transition-all duration-200 ${
                    fieldErrors.nome
                      ? "border-red-400 ring-2 ring-red-400/20"
                      : "border-white/10 focus-within:border-brand/70 focus-within:ring-2 focus-within:ring-brand/30"
                  }`}
                >
                  <input
                    id="staff-nome"
                    type="text"
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value);
                      if (fieldErrors.nome)
                        setFieldErrors((f) => ({ ...f, nome: null }));
                    }}
                    placeholder="Ex: Maria Silva"
                    required
                    className="w-full bg-transparent font-sans text-sm text-white placeholder-white/30 outline-none tracking-wide"
                  />
                </div>
                {fieldErrors.nome && (
                  <p className="font-sans text-[11px] text-red-400 mt-1.5 px-1 font-medium">
                    {fieldErrors.nome}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="staff-email"
                  className="block font-sans text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2"
                >
                  E-mail
                </label>
                <div
                  className={`relative flex items-center rounded-2xl bg-white/4 border px-4 py-3 transition-all duration-200 ${
                    fieldErrors.email
                      ? "border-red-400 ring-2 ring-red-400/20"
                      : "border-white/10 focus-within:border-brand/70 focus-within:ring-2 focus-within:ring-brand/30"
                  }`}
                >
                  <input
                    id="staff-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email)
                        setFieldErrors((f) => ({ ...f, email: null }));
                    }}
                    placeholder="nome@exemplo.com"
                    required
                    className="w-full bg-transparent font-sans text-sm text-white placeholder-white/30 outline-none tracking-wide"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="font-sans text-[11px] text-red-400 mt-1.5 px-1 font-medium">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="staff-senha"
                  className="block font-sans text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2"
                >
                  Senha provisória
                </label>
                <div
                  className={`relative flex items-center rounded-2xl bg-white/4 border px-4 py-3 transition-all duration-200 ${
                    fieldErrors.senha
                      ? "border-red-400 ring-2 ring-red-400/20"
                      : "border-white/10 focus-within:border-brand/70 focus-within:ring-2 focus-within:ring-brand/30"
                  }`}
                >
                  <input
                    id="staff-senha"
                    type="password"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      if (fieldErrors.senha)
                        setFieldErrors((f) => ({ ...f, senha: null }));
                    }}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full bg-transparent font-sans text-sm text-white placeholder-white/30 outline-none tracking-wide"
                  />
                </div>
                {fieldErrors.senha && (
                  <p className="font-sans text-[11px] text-red-400 mt-1.5 px-1 font-medium">
                    {fieldErrors.senha}
                  </p>
                )}
                <p className="font-sans text-[11px] text-white/40 mt-1.5 px-1">
                  Recomende à pessoa alterar a senha no primeiro acesso.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="font-sans text-xs text-red-400 font-medium">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-sans font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand hover:brightness-110 text-white rounded-full py-3.5 mt-2 transition-all duration-300 shadow-lg shadow-brand/30 hover:shadow-brand/50 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Criando acesso...</span>
                  </>
                ) : (
                  <span>Criar Conta de Staff</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
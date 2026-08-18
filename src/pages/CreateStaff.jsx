import { useState } from "react";
import { Link } from "react-router-dom";
import { createStaff } from "../services/staffService";
import backgroundImg from "../assets/background2.jpg";

const ROLES = [
  {
    value: "PORTARIA",
    label: "Porteiro",
    description: "Acessa a validação de ingressos na entrada dos eventos.",
  },
  {
    value: "ORGANIZADOR",
    label: "Organizador",
    description:
      "Acesso total: cria eventos, gerencia ingressos e pode criar outras contas de equipe.",
  },
];

export default function CreateStaff() {
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
    <div className="relative min-h-screen pt-12 md:pt-20 pb-16 px-6 md:px-16 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={backgroundImg}
          alt="Background Eventos"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0f0407]/90" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
      

        <div className="mb-6">
          <span className="font-sans text-[11px] font-bold text-brand uppercase tracking-[0.2em] block mb-1">
            The Stage Is Yours
          </span>
          <h1 className="font-display text-3xl text-white tracking-wide uppercase">
            Nova conta de equipe
          </h1>
          <p className="font-sans text-sm text-white/50 mt-1">
            Crie acessos para Porteiros ou outros Organizadores.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-[#1e293b] uppercase tracking-wide mb-2">
              Conta criada
            </h2>
            <p className="font-sans text-sm text-slate-500 mb-8">
              {success.nome} agora tem acesso como{" "}
              <span className="font-semibold text-[#581c25]">
                {success.role === "PORTARIA" ? "Porteiro" : "Organizador"}
              </span>
              . As credenciais já podem ser compartilhadas com a pessoa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSuccess(null);
                }}
                className="font-sans font-semibold text-xs uppercase tracking-wider bg-[#581c25] hover:bg-[#43121a] text-white rounded-full py-3 px-6 transition-all duration-300"
              >
                Criar outra conta
              </button>
              <Link
                to="/organizador"
                className="font-sans font-semibold text-xs uppercase tracking-wider border border-slate-200 text-slate-500 hover:border-[#581c25]/40 hover:text-[#581c25] rounded-full py-3 px-6 transition-all duration-300 text-center"
              >
                Voltar para Meus Eventos
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-white/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <span className="block font-sans text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Tipo de conta
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      aria-pressed={role === r.value}
                      className={`text-left rounded-2xl p-4 border transition-all duration-200 ${
                        role === r.value
                          ? "bg-[#581c25]/5 border-[#581c25]"
                          : "bg-white border-slate-200 hover:border-[#581c25]/40"
                      }`}
                    >
                      <span className="flex items-center justify-between mb-1">
                        <span
                          className={`font-sans text-sm font-bold uppercase tracking-wide ${
                            role === r.value
                              ? "text-[#581c25]"
                              : "text-[#1e293b]"
                          }`}
                        >
                          {r.label}
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                            role === r.value
                              ? "border-[#581c25] bg-[#581c25]"
                              : "border-slate-300"
                          }`}
                        />
                      </span>
                      <span className="font-sans text-xs text-slate-500 leading-relaxed block">
                        {r.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="staff-nome"
                  className="block font-sans text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2"
                >
                  Nome completo
                </label>
                <div
                  className={`relative border-b-2 transition-colors py-1 ${
                    fieldErrors.nome
                      ? "border-red-400"
                      : "border-slate-200 focus-within:border-[#581c25]"
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
                    className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                    style={{
                      color: "#1e293b",
                      caretColor: "#581c25",
                      colorScheme: "light",
                    }}
                  />
                </div>
                {fieldErrors.nome && (
                  <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                    {fieldErrors.nome}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="staff-email"
                  className="block font-sans text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2"
                >
                  E-mail
                </label>
                <div
                  className={`relative border-b-2 transition-colors py-1 ${
                    fieldErrors.email
                      ? "border-red-400"
                      : "border-slate-200 focus-within:border-[#581c25]"
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
                    className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                    style={{
                      color: "#1e293b",
                      caretColor: "#581c25",
                      colorScheme: "light",
                    }}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="staff-senha"
                  className="block font-sans text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2"
                >
                  Senha provisória
                </label>
                <div
                  className={`relative border-b-2 transition-colors py-1 ${
                    fieldErrors.senha
                      ? "border-red-400"
                      : "border-slate-200 focus-within:border-[#581c25]"
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
                    className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                    style={{
                      color: "#1e293b",
                      caretColor: "#581c25",
                      colorScheme: "light",
                    }}
                  />
                </div>
                {fieldErrors.senha && (
                  <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                    {fieldErrors.senha}
                  </p>
                )}
                <p className="font-sans text-[11px] text-slate-400 mt-1 px-1">
                  Combine com a pessoa que ela deve trocar a senha no primeiro
                  accesso.
                </p>
              </div>

              {error && (
                <p className="font-sans text-xs text-red-500 text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-sans font-semibold text-xs uppercase tracking-wider bg-[#581c25] hover:bg-[#43121a] text-white rounded-full py-3.5 mt-2 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#581c25]/30 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar conta"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
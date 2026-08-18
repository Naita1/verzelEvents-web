import { useState } from "react";
import { createStaff } from "../services/staffService";

export default function CreateStaff() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("PORTARIA");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const ROLES = [
    { value: "PORTARIA", label: "Porteiro" },
    { value: "ORGANIZADOR", label: "Organizador" },
  ];

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    setLoading(true);

    try {
      await createStaff({ nome, email, senha, role });

      setSuccess(`Conta de ${role === "PORTARIA" ? "Porteiro" : "Organizador"} criada com sucesso.`);
      setNome("");
      setEmail("");
      setSenha("");
      setRole("PORTARIA");
    } catch (err) {
      setError(err.message || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/10">
        <div className="mb-8">
          <span className="font-sans text-[11px] font-bold text-brand uppercase tracking-[0.2em] block mb-1">
            The Stage Is Yours
          </span>
          <h1 className="font-display text-2xl text-[#1e293b] tracking-wide uppercase">
            Nova conta de equipe
          </h1>
          <p className="font-sans text-xs text-slate-400 mt-2">
            Crie acessos para Porteiros ou outros Organizadores.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <span className="block font-sans text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Tipo de conta
            </span>
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  aria-pressed={role === r.value}
                  className={`flex-1 rounded-full px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide transition-all duration-200 border ${
                    role === r.value
                      ? "bg-[#581c25] border-[#581c25] text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-[#581c25]/40 hover:text-[#581c25]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div
              className={`relative border-b-2 transition-colors py-1 ${
                fieldErrors.nome
                  ? "border-red-400"
                  : "border-slate-200 focus-within:border-[#581c25]"
              }`}
            >
              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (fieldErrors.nome)
                    setFieldErrors((f) => ({ ...f, nome: null }));
                }}
                placeholder="Nome completo"
                required
                className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                style={{ color: "#1e293b", caretColor: "#581c25", colorScheme: "light" }}
              />
            </div>
            {fieldErrors.nome && (
              <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                {fieldErrors.nome}
              </p>
            )}
          </div>

          <div>
            <div
              className={`relative border-b-2 transition-colors py-1 ${
                fieldErrors.email
                  ? "border-red-400"
                  : "border-slate-200 focus-within:border-[#581c25]"
              }`}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((f) => ({ ...f, email: null }));
                }}
                placeholder="E-mail"
                required
                className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                style={{ color: "#1e293b", caretColor: "#581c25", colorScheme: "light" }}
              />
            </div>
            {fieldErrors.email && (
              <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div
              className={`relative border-b-2 transition-colors py-1 ${
                fieldErrors.senha
                  ? "border-red-400"
                  : "border-slate-200 focus-within:border-[#581c25]"
              }`}
            >
              <input
                type="password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (fieldErrors.senha)
                    setFieldErrors((f) => ({ ...f, senha: null }));
                }}
                placeholder="Senha provisória"
                required
                className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                style={{ color: "#1e293b", caretColor: "#581c25", colorScheme: "light" }}
              />
            </div>
            {fieldErrors.senha && (
              <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                {fieldErrors.senha}
              </p>
            )}
          </div>

          {error && (
            <p className="font-sans text-xs text-red-500 text-center">
              {error}
            </p>
          )}

          {success && (
            <p className="font-sans text-xs text-green-600 text-center">
              {success}
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
    </div>
  );
}
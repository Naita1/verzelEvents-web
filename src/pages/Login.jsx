import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, senha);
      navigate("/");
    } catch (err) {
      setError(err.message || "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex-1 flex flex-col justify-center px-8 md:px-16 py-16">
        <span className="font-sans text-white/40 text-sm tracking-widest uppercase mb-4">
          THE STAGE IS YOURS
        </span>
        <h1 className="font-display text-6xl md:text-7xl leading-none tracking-wide text-white">
          CADA INGRESSO
          <br />
          É UMA <span className="text-brand">HISTÓRIA.</span>
        </h1>
        <p className="font-sans text-white/50 mt-6 max-w-md">
          Entre pra descobrir os próximos eventos, garantir seu lugar e viver o que vem depois.
        </p>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="font-display text-4xl tracking-wide text-white mb-1">
            ENTRAR
          </h2>
          <p className="font-sans text-white/50 text-sm mb-6">
            Acesse sua conta pra continuar
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-sans text-sm text-white/70 block mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="font-sans text-sm text-white/70 block mb-1">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors"
              />
            </div>

            {error && (
              <p className="font-sans text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-sans font-semibold bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-lg py-2 mt-2 transition-colors"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import api from "./api";

/**
 * @param {{ nome: string, email: string, senha: string, role: "PORTARIA" | "ORGANIZADOR" }} dados
 */
export async function createStaff(dados) {
  const { data } = await api.post("/auth/staff", dados);
  return data;
}
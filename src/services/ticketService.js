import api from "./api";

export async function listarIngressos() {
  const response = await api.get("/cliente/ingressos");
  return response.data;
}
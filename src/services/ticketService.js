import api from "./api";

export async function listarIngressos() {
  const response = await api.get("/cliente/ingressos");
  return response.data;
}

export async function buscarIngressoPorToken(token) {
  const response = await api.get(`/tickets/share/${token}`);
  return response.data;
}
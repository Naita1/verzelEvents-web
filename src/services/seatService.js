import api from "./api";

export async function listarAssentos(eventoId) {
  const response = await api.get(`/eventos/${eventoId}/assentos`);
  return response.data;
}

export async function reservarAssento(eventoId, assentoId) {
  const response = await api.post("/cliente/reservas", {
    eventoId,
    assentoId,
    idempotencyKey: crypto.randomUUID(),
  });
  return response.data;
}
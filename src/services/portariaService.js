import api from "./api";

export async function validarIngresso(eventoId, codigo) {
  const response = await api.post("/portaria/validar", { eventoId, codigo });
  return response.data;
}

export async function buscarHistorico(eventoId) {
  const response = await api.get(`/portaria/eventos/${eventoId}/historico`);
  return response.data;
}
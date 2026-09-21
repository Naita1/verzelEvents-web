import { useQuery } from "@tanstack/react-query";
import { listarEventos } from "../../../services/eventService";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: listarEventos,
  });
}

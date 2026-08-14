import api from "./axios";

export async function deleteResource(endpoint, id) {
  return await api.delete(`/${endpoint}/${id}`);
}
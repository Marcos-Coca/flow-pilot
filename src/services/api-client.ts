import axios from "redaxios";

export const apiClient = axios.create({
  baseURL: "/api",
});

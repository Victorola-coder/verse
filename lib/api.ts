import axios from "axios";
import { getSessionId } from "@/lib/session";

export const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const sessionId = getSessionId();
  if (sessionId) {
    config.headers["X-Session-Id"] = sessionId;
  }
  return config;
});

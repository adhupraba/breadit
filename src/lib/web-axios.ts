import { localTunnelHeader } from "@/constants";
import axios from "axios";

export const webAxios = axios.create({
  baseURL: "/api/gateway",
  withCredentials: true,
  headers: localTunnelHeader,
});

import { serverEnv, webEnv } from "@/constants";
import axios from "axios";

export const webAxios = axios.create({ baseURL: webEnv.apiUrl, withCredentials: true });

export const serverAxios = axios.create({ baseURL: serverEnv.apiUrl, withCredentials: true });

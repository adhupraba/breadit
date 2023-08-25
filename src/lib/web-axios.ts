import { webEnv } from "@/constants";
import axios from "axios";

export const webAxios = axios.create({ baseURL: webEnv.apiUrl, withCredentials: true });

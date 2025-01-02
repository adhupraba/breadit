import { localTunnelHeader, serverEnv } from "@/constants";
import axios from "axios";
import { cookies } from "next/headers";

export const serverAxios = () => {
  const cookieStore = cookies().getAll();

  return axios.create({
    baseURL: `${serverEnv.apiUrl}/gateway`,
    withCredentials: true,
    headers: {
      Cookie: cookieStore.map((cookie) => `${cookie.name}=${cookie.value}`).join(";"),
      ...localTunnelHeader,
    },
    validateStatus: () => true,
  });
};

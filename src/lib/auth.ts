import { EXPIRY_THRESHOLD, SESSION_MAX_AGE, serverEnv } from "@/constants";
import type { Account, CallbacksOptions, NextAuthOptions, Profile } from "next-auth";
import { getServerSession } from "next-auth/next";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { serverAxios } from "./server-axios";
import { TApiRes } from "@/types/helpers";
import { TUser } from "@/types/model";

async function refreshAccessToken(tokenObject: JWT): Promise<JWT> {
  // Get a new set of tokens with a refreshToken
  const { data } = await serverAxios().get<TApiRes<{ accessToken: string; accessTokenExpiry: number }>>(
    `${serverEnv.apiUrl}/api/auth/refresh`
  );

  // console.log("refresh token response =>", data);

  if (data.error) {
    return { ...tokenObject, user: null, accessToken: "", accessTokenExpiry: 0 };
  }

  cookies().set({
    name: "access_token",
    value: data.data.accessToken,
    expires: new Date(data.data.accessTokenExpiry),
    maxAge: Math.round(data.data.accessTokenExpiry - Date.now()) / 1000,
    httpOnly: true,
  });

  return {
    ...tokenObject,
    accessToken: data.data.accessToken,
    accessTokenExpiry: data.data.accessTokenExpiry,
  };
}

const callbacks: Partial<CallbacksOptions<Profile, Account>> = {
  jwt: async ({ token, user }) => {
    if (user) {
      token = user as any;
    }

    // accessTokenExpiry and refreshTokenExpiry is in milliseconds
    // If accessTokenExpiry is 24 hours, we have to refresh token before 24 hours pass.
    const shouldRefreshTime = Math.round(token.accessTokenExpiry - Date.now());

    // console.log("shouldRefreshTime", shouldRefreshTime);

    // If the token is still valid, just return it.
    // if the countdown is above EXPIRY_THRESHOLD then use the same token, else if less than EXPIRY_THRESHOLD call refresh token
    if (shouldRefreshTime > EXPIRY_THRESHOLD) {
      // console.log("token is still valid");
      return token;
    }

    // console.log("refreshing token");
    // If the call arrives after 23 hours have passed, we allow to refresh the token.
    token = await refreshAccessToken(token);

    return token;
  },
  session: async ({ token, session }) => {
    if (token) {
      session.user = token.user;
      session.expires = token.accessTokenExpiry;
    }

    return session;
  },
  redirect() {
    return "/";
  },
};

type SigninResData = {
  user: TUser;
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
  refreshTokenExpiry: number;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  pages: { signIn: "/sign-in" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      authorize: async (credentials, req) => {
        const { data, headers } = await serverAxios().post<TApiRes<SigninResData>>("/api/auth/sign-in", {
          email: credentials?.email,
          password: credentials?.password,
        });

        if (data.error || !data.data?.user) return null;

        const loginCookies = headers["set-cookie"] as string[];
        const cookiesArr: ResponseCookie[] = loginCookies.map((cookie) => {
          const split = cookie.split("; ");
          const isSecure = split?.[4] === "Secure";
          const sameSite = (
            !isSecure ? split?.[4]?.split?.("=")?.[1]?.toLowerCase() : split?.[5]?.split?.("=")?.[1]?.toLowerCase()
          ) as "lax" | "strict" | "none" | undefined;

          return {
            name: split[0].split("=")[0],
            value: split[0].split("=")[1],
            path: split[1].split("=")[1],
            maxAge: parseInt(split[2].split("=")[1]),
            httpOnly: true,
            secure: isSecure,
            sameSite,
          };
        });

        cookiesArr.forEach((cookie) => {
          cookies().set(cookie);
        });

        return data.data as any;
      },
    }),
  ],
  callbacks,
};

export const getAuthSession = () => getServerSession(authOptions);

import { EXPIRY_THRESHOLD, SESSION_MAX_AGE } from "@/constants";
import type { Account, CallbacksOptions, NextAuthOptions, Profile } from "next-auth";
import { getServerSession } from "next-auth/next";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { serverAxios } from "./server-axios";
import { TApiRes } from "@/types/helpers";
import { TUser } from "@/types/model";

type RefreshToken = { accessToken: string; accessTokenExpiry: number };

async function refreshAccessToken(tokenObject: JWT): Promise<JWT> {
  // Get a new set of tokens with a refreshToken
  const { data } = await serverAxios().get<TApiRes<RefreshToken>>(`/auth/refresh`);

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
        const { data, headers } = await serverAxios().post<TApiRes<SigninResData>>("/auth/sign-in", {
          email: credentials?.email,
          password: credentials?.password,
        });

        console.log("sign in data =>", data, headers);

        if (data.error || !data.data?.user) return null;

        const loginCookies = headers["set-cookie"] as string[];
        const cookiesArr: ResponseCookie[] = loginCookies.map((cookie) => {
          const split = cookie.split("; ");
          const token = split[0];
          const path = split[1];
          const httpOnly = split[2] === "HttpOnly";
          const maxAge = httpOnly ? split[3] : split[2];

          return {
            name: token.split("=")[0],
            value: token.split("=")[1],
            path: path.split("=")[1],
            maxAge: parseInt(maxAge.split("=")[1]),
            httpOnly: true,
            secure: true,
            sameSite: "none",
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

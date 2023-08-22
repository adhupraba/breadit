import { serverEnv } from "@/constants";
import axios from "axios";
import { Account, CallbacksOptions, NextAuthOptions, Profile, getServerSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

async function refreshAccessToken(tokenObject: JWT) {
  // Get a new set of tokens with a refreshToken
  const { data } = await axios.get(`${serverEnv.apiUrl}/api/auth/refresh`);

  return {
    ...tokenObject,
    accessToken: data.accessToken,
  };
}

const callbacks: Partial<CallbacksOptions<Profile, Account>> = {
  jwt: async ({ token, user }) => {
    // console.log("jwt callback: token =>", token);
    // console.log("jwt callback: user =>", user);

    if (user) {
      token = user as any;
    }

    // console.log("current time =>", Date.now());

    // accessTokenExpiry and refreshTokenExpiry is in milliseconds
    // If accessTokenExpiry is 24 hours, we have to refresh token before 24 hours pass.
    const shouldRefreshTime = Math.round(token.accessTokenExpiry - Date.now());

    // If the token is still valid, just return it.
    if (shouldRefreshTime > 0) {
      return token;
    }

    // console.log("refreshing token");
    // If the call arrives after 23 hours have passed, we allow to refresh the token.
    token = await refreshAccessToken(token);

    //  return {
    //    id: dbUser.id,
    //    name: dbUser.name,
    //    email: dbUser.email,
    //    picture: dbUser.image,
    //    username: dbUser.username,
    //  };

    return token;
  },
  session: async ({ token, session }) => {
    // console.log("session callback: token =>", token);
    // console.log("session callback: session =>", session);

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

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 },
  pages: { signIn: "/sign-in" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      authorize: async (credentials, req) => {
        const { data, headers } = await axios.post(`${serverEnv.apiUrl}/api/auth/sign-in`, {
          email: credentials?.email,
          password: credentials?.password,
        });

        if (!data.user) return null;

        const loginCookies = headers["set-cookie"] as string[];
        const cookiesArr: ResponseCookie[] = loginCookies.map((cookie) => {
          const split = cookie.split("; ");

          return {
            name: split[0].split("=")[0],
            value: split[0].split("=")[1],
            expires: new Date(split[1].split("=")[1]),
            maxAge: parseInt(split[2].split("=")[1]),
            httpOnly: true,
          };
        });

        cookiesArr.forEach((cookie) => {
          cookies().set(cookie);
        });

        return data;
      },
    }),
  ],
  callbacks,
};

export const getAuthSession = () => getServerSession(authOptions);

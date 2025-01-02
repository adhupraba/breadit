import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

type UserData = {
  id: number;
  name: string;
  email: string;
  username: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type JWTData = {
  user: UserData | null;
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
  refreshTokenExpiry: number;
};

declare module "next-auth/jwt" {
  interface JWT extends JWTData {}
  interface User extends JWTData {}
  interface AdapterUser extends JWTData {}
}

declare module "next-auth" {
  interface Session {
    user: UserData | null;
    expires: number;
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverAxios } from "@/lib/server-axios";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data } = await serverAxios().get("/auth/sign-out");

    cookies().delete("access_token");
    cookies().delete("refresh_token");
    cookies().delete("logged_in");
  } catch (err) {
    console.error("logout error...", err);
  } finally {
    return NextResponse.json({ message: "logged out" });
  }
}

"use client";

import Link from "next/link";
import { Icons } from "./Icons";
import UserLoginForm from "./UserLoginForm";
import { FC } from "react";

interface ISignInProps {
  isModal?: boolean;
}

const SignIn: FC<ISignInProps> = ({ isModal }) => {
  return (
    <div className="container max-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up a Breadit account and agreeing to our User Agreement and Privacy Policy.
        </p>

        {/* sign in form */}
        <UserLoginForm />

        <p className="px-8 text-center text-sm text-zinc-700">
          New to Breadit?{" "}
          <Link href="/sign-up" className="hover:text-zinc-800 text-sm underline underline-offset-4" replace={isModal}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

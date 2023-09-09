"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "./ui/Tooltip";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false} session={null}>
        <TooltipProvider>{children}</TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default Providers;

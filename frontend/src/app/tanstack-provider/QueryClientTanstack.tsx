"use client"
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode } from "react";

export function QueryClientTanstack({ children }:{ children:ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 1,
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
            },
            mutations: {
            retry: false,
            },
        },
    });
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

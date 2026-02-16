import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
{{#if routing}}
import { BrowserRouter } from "react-router-dom";
{{/if}}
{{#if fetching}}
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
{{/if}}
import { App } from "@/app/App";
import "@/app/index.css";
{{#if fetching}}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});
{{/if}}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {{#if fetching}}
    <QueryClientProvider client={queryClient}>
    {{/if}}
      {{#if routing}}
      <BrowserRouter>
      {{/if}}
        <App />
      {{#if routing}}
      </BrowserRouter>
      {{/if}}
    {{#if fetching}}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    {{/if}}
  </StrictMode>
);
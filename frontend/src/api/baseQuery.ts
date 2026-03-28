import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  prepareHeaders: (headers) => {
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      const { access } = JSON.parse(tokens);
      headers.set("Authorization", `Bearer ${access}`);
    }
    return headers;
  },
});

export const baseQueryWithTokenHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      const { refresh } = JSON.parse(tokens);
      const refreshResult = await rawBaseQuery(
        {
          url: "/api/token/refresh/",
          method: "POST",
          body: { refresh },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const newTokens = refreshResult.data as { access: string };
        const existing = JSON.parse(tokens);
        localStorage.setItem(
          "tokens",
          JSON.stringify({ ...existing, access: newTokens.access })
        );
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        localStorage.removeItem("tokens");
        window.location.href = "/auth/login";
      }
    }
  }

  return result;
};

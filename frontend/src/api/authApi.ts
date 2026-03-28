import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface TokenResponse {
  access: string;
  refresh: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  }),
  endpoints: (builder) => ({
    login: builder.mutation<
      TokenResponse,
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: "/api/token/",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;

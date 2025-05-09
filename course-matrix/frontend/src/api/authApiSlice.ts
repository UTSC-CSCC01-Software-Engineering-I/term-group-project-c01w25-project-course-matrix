import { get } from "http";
import { apiSlice } from "./baseApiSlice";
import { AUTH_URL } from "./config";

// Endpoints for /api/auth
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/login`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${AUTH_URL}/logout`,
        method: "POST",
        credentials: "include",
      }),
    }),
    signup: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/signup`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
    }),
    getSession: builder.query<any, void>({
      query: () => ({
        url: `${AUTH_URL}/session`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        credentials: "include",
      }),
    }),
    accountDelete: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/accountDelete`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
    }),
    updateUsername: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/updateUsername`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
    }),
    getUsernameFromUserId: builder.query<any, string | number>({
      query: (user_id) => ({
        url: `${AUTH_URL}/username-from-user-id`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        params: { user_id },
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
  useGetSessionQuery,
  useAccountDeleteMutation,
  useUpdateUsernameMutation,
  useGetUsernameFromUserIdQuery,
} = authApiSlice;

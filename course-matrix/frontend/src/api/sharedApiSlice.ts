import { apiSlice } from "./baseApiSlice";
import { SHARED_URL } from "./config";

// Endpoints for /api/timetables/shared
export const sharedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createShare: builder.mutation({
      query: (data) => ({
        url: `${SHARED_URL}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Shared"],
    }),
    getTimetablesSharedWithMe: builder.query<unknown, void>({
      query: () => ({
        url: `${SHARED_URL}/me`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Shared"],
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    getTimetablesSharedWithOthers: builder.query<unknown, string | number>({
      query: () => ({
        url: `${SHARED_URL}/owner`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Shared"],
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    getSharedRestrictions: builder.query<
      unknown,
      { user_id: string; calendar_id: number }
    >({
      query: (data) => ({
        url: `${SHARED_URL}/restrictions`,
        method: "GET",
        params: data,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Shared"],
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    deleteSharedTimetablesWithMe: builder.mutation({
      query: (data) => ({
        url: `${SHARED_URL}/me`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Timetable"],
    }),
    deleteSharedTimetablesWithOthers: builder.mutation({
      query: (data) => ({
        url: `${SHARED_URL}/owner/${data.id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Timetable"],
    }),
  }),
});

export const {
  useCreateShareMutation,
  useGetTimetablesSharedWithMeQuery,
  useGetTimetablesSharedWithOthersQuery,
  useGetSharedRestrictionsQuery,
  useDeleteSharedTimetablesWithMeMutation,
  useDeleteSharedTimetablesWithOthersMutation,
} = sharedApiSlice;

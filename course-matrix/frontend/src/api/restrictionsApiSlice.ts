import { apiSlice } from "./baseApiSlice";
import { TIMETABLES_URL } from "./config";

// Endpoints for /api/timetables/restrictions
export const restrictionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRestrictions: builder.query({
      query: (id) => ({
        url: `${TIMETABLES_URL}/restrictions/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Restrictions"],
        credentials: "include",
      }),
    }),
    createRestriction: builder.mutation({
      query: (data) => ({
        url: `${TIMETABLES_URL}/restrictions`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Restrictions"],
        body: data,
        credentials: "include",
      }),
    }),
    deleteRestriction: builder.mutation({
      query: (id) => ({
        url: `${TIMETABLES_URL}/restrictions/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Restrictions"],
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetRestrictionsQuery,
  useCreateRestrictionMutation,
  useDeleteRestrictionMutation,
} = restrictionsApiSlice;

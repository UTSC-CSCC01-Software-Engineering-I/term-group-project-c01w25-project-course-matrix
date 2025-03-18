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
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Restrictions"],
    }),
    deleteRestriction: builder.mutation({
      query: (id) => ({
        url: `${TIMETABLES_URL}/restrictions/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        credentials: "include",
      }),
      invalidatesTags: ["Restrictions"],
    }),
  }),
});

export const {
  useGetRestrictionsQuery,
  useCreateRestrictionMutation,
  useDeleteRestrictionMutation,
} = restrictionsApiSlice;

import { apiSlice } from "./baseApiSlice";
import { TIMETABLES_URL } from "./config";

// Endpoints for /api/timetables
export const timetableApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTimetable: builder.mutation({
      query: (data) => ({
        url: `${TIMETABLES_URL}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Timetable"],
    }),
    getTimetables: builder.query<unknown, void>({
      query: () => ({
        url: `${TIMETABLES_URL}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Timetable"],
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    updateTimetable: builder.mutation({
      query: (data) => ({
        url: `${TIMETABLES_URL}/${data.id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Timetable"],
    }),
    deleteTimetable: builder.mutation({
      query: (id) => ({
        url: `${TIMETABLES_URL}/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        credentials: "include",
      }),
      invalidatesTags: ["Timetable"],
    }),
  }),
});

export const {
  useGetTimetablesQuery,
  useUpdateTimetableMutation,
  useCreateTimetableMutation,
  useDeleteTimetableMutation,
} = timetableApiSlice;

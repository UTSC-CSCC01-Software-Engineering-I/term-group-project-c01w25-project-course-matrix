import { data } from "react-router-dom";
import { apiSlice } from "./baseApiSlice";
import { EVENTS_URL } from "./config";

// Endpoints for /api/timetables/events
export const eventsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation({
      query: (data) => ({
        url: `${EVENTS_URL}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Event"],
    }),
    getEvents: builder.query<unknown, number>({
      query: (id) => ({
        url: `${EVENTS_URL}/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Event"],
        credentials: "include",
      }),
    }),
    updateEvent: builder.mutation({
      query: (data) => ({
        url: `${EVENTS_URL}/${data.id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Event"],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `${EVENTS_URL}/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        credentials: "include",
      }),
      invalidatesTags: ["Event"],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useGetEventsQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApiSlice;

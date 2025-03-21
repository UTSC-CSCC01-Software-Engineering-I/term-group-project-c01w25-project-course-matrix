import { apiSlice } from "./baseApiSlice";
import { OFFERINGS_URL } from "./config";

// Endpoints for /api/offerings
export const offeringsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOfferingEvents: builder.query({
      query: (params) => ({
        url: `${OFFERINGS_URL}/events`,
        method: "GET",
        params: params,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["OfferingEvents"],
        credentials: "include",
      }),
    }),
    getOfferings: builder.query({
      query: (params) => ({
        url: `${OFFERINGS_URL}`,
        method: "GET",
        params: params,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Offerings"],
        credentials: "include",
      }),
    }),
  }),
});

export const { useGetOfferingsQuery, useGetOfferingEventsQuery } =
  offeringsApiSlice;

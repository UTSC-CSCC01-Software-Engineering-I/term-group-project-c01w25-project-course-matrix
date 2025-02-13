import {apiSlice} from './baseApiSlice'
import {OFFERINGS_URL} from "./config"

// Endpoints for /api/offerings
export const offeringsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
      getOfferings: builder.query({
          query: (params) => ({
              url: `${OFFERINGS_URL}`,
              method: 'GET',
              params: params,
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json, text/plain, */*'
              },
              providesTags: ["Offerings"],
              credentials: 'include',
          }),
      }),
  })
})

export const {
  useGetOfferingsQuery,
} = offeringsApiSlice;
import { apiSlice } from "./baseApiSlice";
import { COURSES_URL } from "./config";

// Endpoints for /api/courses
export const coursesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: (filters) => ({
        url: `${COURSES_URL}`,
        method: "GET",
        params: filters,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Course"],
        credentials: "include",
      }),
    }),
    getNumberOfCourseSections: builder.query({
      query: (params) => ({
        url: `${COURSES_URL}/total-sections`,
        method: "GET",
        params: params,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        providesTags: ["Course"],
        credentials: "include",
      }),
    }),
  }),
});

export const { useGetCoursesQuery, useGetNumberOfCourseSectionsQuery } =
  coursesApiSlice;

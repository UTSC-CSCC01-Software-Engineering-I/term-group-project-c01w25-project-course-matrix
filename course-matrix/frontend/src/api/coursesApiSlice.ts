import {apiSlice} from './baseApiSlice'
import {COURSES_URL} from "./config"

// Endpoints for /api/courses
export const coursesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
      getCourses: builder.query({
          query: (filters) => ({
              url: `${COURSES_URL}`,
              method: 'GET',
              params: filters,
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json, text/plain, */*'
              },
              tags: ["Course"],
              credentials: 'include',
          }),
      }),
  })
})

export const {
  useGetCoursesQuery,
} = coursesApiSlice;
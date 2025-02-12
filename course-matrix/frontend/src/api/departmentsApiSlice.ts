import {apiSlice} from './baseApiSlice'
import {COURSES_URL} from "./config"

// Endpoints for /api/departments
export const departmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
      getDepartments: builder.query<any, void>({
          query: () => ({
              url: `${COURSES_URL}`,
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json, text/plain, */*'
              },
              providesTags: ["Department"],
              credentials: 'include',
          }),
      }),
  })
})

export const {
  useGetDepartmentsQuery,
} = departmentApiSlice;
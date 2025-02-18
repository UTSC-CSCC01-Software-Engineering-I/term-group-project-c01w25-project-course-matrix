import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query/react";
import {apiSlice} from "../api/baseApiSlice";
import authReducer from "./authslice"

/**
 * Sets up a store using Redux Toolkit to store application state information. 
 */

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
    },

    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
})

setupListeners(store.dispatch)

export default store

export type RootState = ReturnType<typeof store.getState>
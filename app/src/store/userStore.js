import { configureStore } from "@reduxjs/toolkit"
import user from "./userSlice"

export const userStore = configureStore({
    reducer: {
        user: user
    }
})
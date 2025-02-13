import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        username: "",
        email: "",
        password: "" 
    },
    reducers: {
        updateUserData : (state, action) => {
            state[action.payload.name] = action.payload.value ;
        }
    }
})

export const { updateUserData } = userSlice.actions

export default userSlice.reducer
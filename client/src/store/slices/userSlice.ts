import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface IState {
    username: string;
    email: string;
    _id: string;
    isActivated: boolean;
}

const initialState: IState = {
    username: '',
    email: '',
    _id: '',
    isActivated: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{
                username: string;
                email: string;
                _id: string;
                isActivated: boolean;
            }>,
        ) => {
            state.username = action.payload.username;
            state.email = action.payload.email;
            state._id = action.payload._id;
            state.isActivated = action.payload.isActivated;
        },
        activate: (state) => {
            state.isActivated = true;
        },
    },
});

export default userSlice.reducer;
export const { setUser, activate } = userSlice.actions;

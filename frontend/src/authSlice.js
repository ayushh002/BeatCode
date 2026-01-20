import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "./utils/axiosClient";

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      return response.data.user;
    }
    catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("User Registration Failed");
      }
      const message = err.response?.data || err.message || 'Something went wrong';
      return rejectWithValue(message);
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data.user;
    }
    catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("Invalid email or password");
      }
      const message = err.response?.data || err.message || 'Something went wrong';
      return rejectWithValue(message);
    }
  }
)
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/user/check');
      return response.data.user;
    }
    catch (err) {
      if (err.response?.status === 401) {
        // expected if user isn't logged in
        return rejectWithValue(null);
      }
      const message = err.response?.data || err.message || 'Something went wrong';
      return rejectWithValue(message);
    }
  }
)
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    }
    catch (err) {
      if (err.response?.status === 401) {
        return null;
      }
      const message = err.response?.data || err.message || 'Something went wrong';
      return rejectWithValue(message);
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loading: false,
    user: null,
    isAuthenticated: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // case for register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || 'Something went wrong.';
      })

      // case for login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || 'Something went wrong.';
      })

      // case for check authetication
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || 'Something went wrong.';
      })

      // case for logout user
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || 'Something went wrong.';
      })

  }

})

export default authSlice.reducer;
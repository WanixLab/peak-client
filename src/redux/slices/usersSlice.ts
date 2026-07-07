import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { ApiError } from '@/services/apiClient';
import * as usersService from '@/services/usersService';
import type { User, UserInput } from '@/services/usersService';

/**
 * Users CRUD slice — a reference template for data features.
 *
 * Each operation is a `createAsyncThunk` that calls `usersService` and updates
 * the store on success. `status` tracks the initial list load; `saving` tracks
 * create/update/delete so the UI can disable controls while a write is
 * in-flight. Copy this file to scaffold a new resource.
 */
export interface UsersState {
  items: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  saving: boolean;
}

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: null,
  saving: false,
};

function messageOf(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'users/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await usersService.list();
    } catch (err) {
      return rejectWithValue(messageOf(err));
    }
  },
);

export const createUser = createAsyncThunk<User, UserInput, { rejectValue: string }>(
  'users/create',
  async (input, { rejectWithValue }) => {
    try {
      const created = await usersService.create(input);
      // JSONPlaceholder always echoes id 11; use a locally-unique id so the
      // demo list stays consistent. A real backend returns the true id here.
      return { ...created, ...input, id: created.id > 10 ? Date.now() : created.id };
    } catch (err) {
      return rejectWithValue(messageOf(err));
    }
  },
);

export const updateUser = createAsyncThunk<
  { id: number; input: UserInput },
  { id: number; input: UserInput },
  { rejectValue: string }
>('users/update', async ({ id, input }, { rejectWithValue }) => {
  try {
    await usersService.update(id, input);
    return { id, input };
  } catch (err) {
    return rejectWithValue(messageOf(err));
  }
});

export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await usersService.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(messageOf(err));
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load users';
      })
      // Create
      .addCase(createUser.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateUser.fulfilled, (state, action) => {
        state.saving = false;
        const user = state.items.find((u) => u.id === action.payload.id);
        if (user) Object.assign(user, action.payload.input);
      })
      // Delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((u) => u.id !== action.payload);
      })
      // Shared pending/rejected for the three write operations.
      .addMatcher(
        (action) => /users\/(create|update|delete)\/pending$/.test(action.type),
        (state) => {
          state.saving = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is { type: string; payload?: string } =>
          /users\/(create|update|delete)\/rejected$/.test(action.type),
        (state, action) => {
          state.saving = false;
          state.error = action.payload ?? 'Operation failed';
        },
      );
  },
});

export const { clearUsersError } = usersSlice.actions;

// Selectors
export const selectUsers = (state: RootState) => state.users.items;
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectUsersSaving = (state: RootState) => state.users.saving;

export default usersSlice.reducer;

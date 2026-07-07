import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import usersReducer from './slices/usersSlice';

/**
 * Root reducer — the single place to register a slice.
 *
 * Add a new feature by importing its reducer and adding one line here; the
 * store factory in `store.ts` stays untouched. Keeping this separate from the
 * store also lets tools (and tests) build the reducer tree without spinning up
 * a full store.
 */
export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  users: usersReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;

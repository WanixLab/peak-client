import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './index';

/**
 * Create a fresh store instance. A factory (rather than a singleton) keeps
 * server renders isolated and plays nicely with the App Router. Slices are
 * registered in `rootReducer` (see `./index`).
 */
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

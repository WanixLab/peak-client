import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { layoutConfig } from '@/config';

export interface UiState {
  /** Whether the sidebar/drawer is open. */
  sidebarOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: layoutConfig.sidebarDefaultOpen,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebar } = uiSlice.actions;
export default uiSlice.reducer;

import { describe, it, expect } from 'vitest';
import reducer, { toggleSidebar, setSidebar } from './uiSlice';

describe('uiSlice', () => {
  it('toggles the sidebar', () => {
    const start = { sidebarOpen: true };
    const next = reducer(start, toggleSidebar());
    expect(next.sidebarOpen).toBe(false);
    expect(reducer(next, toggleSidebar()).sidebarOpen).toBe(true);
  });

  it('sets the sidebar explicitly', () => {
    expect(reducer({ sidebarOpen: true }, setSidebar(false)).sidebarOpen).toBe(false);
  });
});

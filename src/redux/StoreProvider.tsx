'use client';

import * as React from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

/**
 * Wraps the app in a Redux provider, creating the store once per client via a
 * lazy state initializer (safe under React's strict purity rules).
 */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = React.useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}

import { createApiClient } from './apiClient';

/**
 * Demo users service.
 *
 * Talks to the public JSONPlaceholder API so the CRUD example works out of the
 * box. Note: JSONPlaceholder *fakes* writes — nothing is persisted, and it only
 * knows the 10 seeded users, so PUT/DELETE to an id it didn't seed (e.g. a row
 * you just created locally) can return 500. The slice reflects mutations in
 * local state regardless (see usersSlice). Point `client` at your real backend
 * and the same service/slice/page wiring keeps working.
 */
const client = createApiClient('https://jsonplaceholder.typicode.com');

/** A user as returned by the API (trimmed to the fields we use). */
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  company?: { name: string };
}

/** Fields accepted when creating or updating a user. */
export interface UserInput {
  name: string;
  email: string;
  phone?: string;
  website?: string;
}

/**
 * Data-access layer ("service"). Each function performs one API call and
 * returns a Promise — no store, no dispatch. The slice (the "controller")
 * wraps these in thunks. Import as a namespace: `import * as usersService`.
 */
export function list(): Promise<User[]> {
  return client.get<User[]>('/users');
}

export function get(id: number): Promise<User> {
  return client.get<User>(`/users/${id}`);
}

export function create(input: UserInput): Promise<User> {
  return client.post<User>('/users', input);
}

export function update(id: number, input: UserInput): Promise<User> {
  return client.put<User>(`/users/${id}`, input);
}

export function remove(id: number): Promise<void> {
  return client.delete<void>(`/users/${id}`);
}

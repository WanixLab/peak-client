import { describe, it, expect } from 'vitest';
import { getMenuForRole, type MenuItem } from './index';

/** Flatten the menu tree (parents + descendants) for easy assertions. */
function flatten(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => (item.children ? [item, ...flatten(item.children)] : [item]));
}

describe('getMenuForRole', () => {
  it('hides role-restricted items (including nested ones) from anonymous users', () => {
    const visible = flatten(getMenuForRole(undefined));
    // `users` is an admin-only child of the Management submenu.
    expect(visible.some((item) => item.id === 'users')).toBe(false);
    // Unrestricted items stay visible.
    expect(visible.some((item) => item.id === 'home')).toBe(true);
  });

  it('shows admin-only items to admins', () => {
    const visible = flatten(getMenuForRole('admin'));
    expect(visible.some((item) => item.id === 'users')).toBe(true);
  });

  it('keeps a parent visible as long as one child is unrestricted', () => {
    // Management still shows for anonymous users because Documents has no roles,
    // even though Users is admin-only.
    const management = getMenuForRole(undefined).find((item) => item.id === 'management');
    expect(management).toBeDefined();
    expect(management?.children?.map((child) => child.id)).toEqual(['documents']);
  });
});

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { appConfig, menuItems, type MenuItem } from '@/config';

/**
 * Index the menu tree so a URL segment can be labeled and — crucially — so we
 * know which paths are real routes. Parent items that only group `children`
 * have no page of their own; their container path (e.g. `/management`) is
 * recorded for labeling but never linked, so clicking it can't 404.
 */
const routeTitles = new Map<string, string>();
const containerTitles = new Map<string, string>();
(function index(items: MenuItem[]) {
  for (const item of items) {
    if (item.path) routeTitles.set(item.path, item.title);
    if (item.children && item.children.length > 0) {
      const child = item.children.find((c) => c.path);
      if (child?.path) {
        const base = child.path.slice(0, child.path.lastIndexOf('/'));
        if (base) containerTitles.set(base, item.title);
      }
      index(item.children);
    }
  }
})(menuItems);

function prettify(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

interface Crumb {
  path: string;
  label: string;
  /** Set only when the crumb points at a real, navigable route. */
  href?: string;
}

/**
 * Location trail built from the current path. Long trails collapse to an
 * ellipsis in the middle; the last crumb is the current page. Only real routes
 * are links — parent/container segments render as plain text so they never
 * navigate to a non-existent page. A leading Home crumb guarantees the first
 * breadcrumb is always a valid way back.
 */
export default function Breadcrumbs() {
  const pathname = usePathname();
  const home = appConfig.routes.home;
  const segments = pathname.split('/').filter(Boolean);

  const crumbs: Crumb[] = segments.map((segment, i) => {
    const path = `/${segments.slice(0, i + 1).join('/')}`;
    const last = i === segments.length - 1;
    const label = routeTitles.get(path) ?? containerTitles.get(path) ?? prettify(segment);
    // Link only to real routes, and never link the current (last) page.
    const href = !last && routeTitles.has(path) ? path : undefined;
    return { path, label, href };
  });

  // Always start from Home so there's a valid "back" target, unless we're
  // already within the home route (its own crumb serves the same purpose).
  const underHome = pathname === home || pathname.startsWith(`${home}/`);
  if (home && !underHome) {
    crumbs.unshift({ path: home, label: routeTitles.get(home) ?? 'Home', href: home });
  }

  return (
    <MuiBreadcrumbs
      aria-label="breadcrumb"
      maxItems={3}
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ '& .MuiBreadcrumbs-separator': { color: 'text.disabled', mx: 0.75 } }}
    >
      {crumbs.map((crumb, i) => {
        const last = i === crumbs.length - 1;
        return crumb.href ? (
          <MuiLink
            key={crumb.path}
            component={Link}
            href={crumb.href}
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: 15 }}
          >
            {crumb.label}
          </MuiLink>
        ) : (
          <Typography
            key={crumb.path}
            color={last ? 'text.primary' : 'text.secondary'}
            sx={{ fontWeight: last ? 700 : 500, fontSize: last ? 16 : 15 }}
          >
            {crumb.label}
          </Typography>
        );
      })}
    </MuiBreadcrumbs>
  );
}

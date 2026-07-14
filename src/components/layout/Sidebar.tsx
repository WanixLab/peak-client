'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem as MuiMenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSidebar } from '@/redux/slices/uiSlice';
import { appConfig, getMenuGroupsForRole, layoutConfig, type MenuItem } from '@/config';

const bp = layoutConfig.permanentDrawerBreakpoint;

/**
 * Brand block pinned to the top of the drawer (same height as the header, so
 * the two line up). Collapses to just the logo mark in the mini rail.
 */
function Brand({ mini }: { mini: boolean }) {
  return (
    <Toolbar
      disableGutters
      sx={{
        height: layoutConfig.headerHeight,
        gap: 1.25,
        px: mini ? 0 : 2,
        justifyContent: mini ? 'center' : 'flex-start',
      }}
    >
      <Box
        component="img"
        src="/PEAK-icon.png"
        alt=""
        sx={{ width: 36, height: 36, flexShrink: 0, maxWidth: 'none' }}
      />
      {!mini && (
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: 0.3 }}>
            {appConfig.shortName}
          </Typography>
          <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {appConfig.name}
          </Typography>
        </Box>
      )}
    </Toolbar>
  );
}

/**
 * Side navigation.
 *
 * Only one drawer is mounted at a time (chosen by viewport) to avoid the two
 * variants fighting over styles:
 * - Desktop: a permanent drawer that collapses to an icon-only rail with
 *   hover tooltips (instead of hiding completely).
 * - Mobile: a temporary overlay drawer, always full width.
 *
 * Items with `children` render as submenus: a collapsible group when the rail
 * is expanded, or a hover/click flyout when it's collapsed to icons.
 */
export default function Sidebar() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const role = useAppSelector((state) => state.auth.user?.role);
  const groups = getMenuGroupsForRole(role);

  // Assume desktop for SSR/first paint so hydration matches, then correct.
  const isDesktop = useMediaQuery(theme.breakpoints.up(bp), { defaultMatches: true });

  const isActive = React.useCallback(
    (path?: string) => !!path && (pathname === path || pathname.startsWith(`${path}/`)),
    [pathname],
  );
  const isParentActive = React.useCallback(
    (item: MenuItem) => item.children?.some((child) => isActive(child.path)) ?? false,
    [isActive],
  );

  // The parent whose submenu holds the active route (or null when the active
  // route is a top-level item). This is the submenu expanded by default.
  const activeParentId = groups.flatMap((group) => group.items).find(isParentActive)?.id ?? null;

  // Accordion behaviour (desktop): only one submenu is expanded at a time.
  // `openId` is the currently-open parent, or null when all are collapsed;
  // opening one closes any other. It re-syncs to the active section whenever
  // navigation moves into a different one — adjusted during render (React's
  // recommended alternative to an effect), so no effect is needed to keep it in
  // step with the route.
  const [openId, setOpenId] = React.useState<string | null>(activeParentId);
  const [syncedParentId, setSyncedParentId] = React.useState<string | null>(activeParentId);
  if (activeParentId !== syncedParentId) {
    setSyncedParentId(activeParentId);
    setOpenId(activeParentId);
  }
  const isOpen = (item: MenuItem) => openId === item.id;
  // Toggle a parent: collapse it if already open, otherwise open it (which
  // closes whichever submenu was open before).
  const toggleParent = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  // Flyout submenu shown for a parent while the rail is collapsed to icons.
  const [flyout, setFlyout] = React.useState<{ anchor: HTMLElement; item: MenuItem } | null>(null);

  // A single navigation link (leaf). `depth` indents nested items.
  const renderLeaf = (item: MenuItem, mini: boolean, onNavigate?: () => void, depth = 0) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Tooltip
        key={item.id}
        title={item.title}
        placement="right"
        disableHoverListener={!mini}
        disableFocusListener={!mini}
        disableTouchListener={!mini}
      >
        <ListItemButton
          component={Link}
          href={item.path ?? '#'}
          selected={active}
          onClick={onNavigate}
          sx={{
            borderRadius: 2,
            minHeight: 44,
            justifyContent: mini ? 'center' : 'flex-start',
            pr: mini ? 1.5 : 2,
            pl: mini ? 1.5 : 2 + depth * 2,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 24,
              flexShrink: 0,
              mr: mini ? 0 : 2,
              justifyContent: 'center',
              color: active ? 'primary.main' : 'text.secondary',
            }}
          >
            <Icon fontSize="small" />
          </ListItemIcon>
          {!mini && (
            <ListItemText
              primary={item.title}
              slotProps={{ primary: { sx: { fontSize: 14, fontWeight: active ? 600 : 500 } } }}
              sx={{ whiteSpace: 'nowrap' }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  // A parent item: toggles an inline Collapse when expanded, or opens a flyout
  // menu when the rail is collapsed to icons.
  const renderParent = (item: MenuItem, mini: boolean, onNavigate?: () => void) => {
    const Icon = item.icon;
    const parentActive = isParentActive(item);
    const open = !mini && isOpen(item);

    return (
      <React.Fragment key={item.id}>
        <Tooltip
          title={item.title}
          placement="right"
          disableHoverListener={!mini}
          disableFocusListener={!mini}
          disableTouchListener={!mini}
        >
          <ListItemButton
            onClick={(e) =>
              mini ? setFlyout({ anchor: e.currentTarget, item }) : toggleParent(item.id)
            }
            selected={mini && parentActive}
            sx={{
              borderRadius: 2,
              minHeight: 44,
              justifyContent: mini ? 'center' : 'flex-start',
              px: mini ? 1.5 : 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 24,
                flexShrink: 0,
                mr: mini ? 0 : 2,
                justifyContent: 'center',
                color: parentActive ? 'primary.main' : 'text.secondary',
              }}
            >
              <Icon fontSize="small" />
            </ListItemIcon>
            {!mini && (
              <>
                <ListItemText
                  primary={item.title}
                  slotProps={{
                    primary: { sx: { fontSize: 14, fontWeight: parentActive ? 600 : 500 } },
                  }}
                  sx={{ whiteSpace: 'nowrap' }}
                />
                <KeyboardArrowDownIcon
                  fontSize="small"
                  sx={{
                    color: 'text.secondary',
                    transition: 'transform .2s ease',
                    transform: open ? 'rotate(180deg)' : 'none',
                  }}
                />
              </>
            )}
          </ListItemButton>
        </Tooltip>

        {!mini && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children!.map((child) => renderLeaf(child, false, onNavigate, 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const renderItem = (item: MenuItem, mini: boolean, onNavigate?: () => void) =>
    item.children && item.children.length > 0
      ? renderParent(item, mini, onNavigate)
      : renderLeaf(item, mini, onNavigate);

  const renderList = (mini: boolean, onNavigate?: () => void) => (
    <>
      <Brand mini={mini} />
      <Box sx={{ overflowX: 'hidden', overflowY: 'auto', py: 1 }}>
        {groups.map((group, index) => (
          <List
            key={group.section ?? `group-${index}`}
            sx={{ px: mini ? 0.5 : 1 }}
            subheader={
              // Section heading when expanded; a thin divider between groups in
              // the mini rail (skipped before the first group, which already
              // sits under the brand).
              group.section ? (
                mini ? (
                  index > 0 ? <Divider component="li" sx={{ mx: 1, my: 1 }} /> : undefined
                ) : (
                  <ListSubheader
                    disableSticky
                    sx={{
                      bgcolor: 'transparent',
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: 12,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      lineHeight: 2.5,
                    }}
                  >
                    {group.section}
                  </ListSubheader>
                )
              ) : undefined
            }
          >
            {group.items.map((item: MenuItem) => renderItem(item, mini, onNavigate))}
          </List>
        ))}
      </Box>

      {/* Flyout submenu for the collapsed rail (anchored to the parent icon). */}
      <Menu
        anchorEl={flyout?.anchor ?? null}
        open={Boolean(flyout)}
        onClose={() => setFlyout(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ list: { dense: true, sx: { minWidth: 200 } } }}
      >
        {flyout && (
          <Typography
            variant="caption"
            sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 700, color: 'text.secondary' }}
          >
            {flyout.item.title}
          </Typography>
        )}
        {flyout?.item.children?.map((child) => {
          const ChildIcon = child.icon;
          return (
            <MuiMenuItem
              key={child.id}
              component={Link}
              href={child.path ?? '#'}
              selected={isActive(child.path)}
              onClick={() => {
                setFlyout(null);
                onNavigate?.();
              }}
            >
              <ListItemIcon sx={{ color: isActive(child.path) ? 'primary.main' : 'text.secondary' }}>
                <ChildIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={child.title} slotProps={{ primary: { sx: { fontSize: 14 } } }} />
            </MuiMenuItem>
          );
        })}
      </Menu>
    </>
  );

  const paperBase = {
    boxSizing: 'border-box' as const,
    // MUI gives the docked drawer a default right border; drop it for a
    // seamless, borderless look (the paper/background tone still separates
    // the rail from the content).
    borderRight: 0,
    overflowX: 'hidden' as const,
  };

  if (!isDesktop) {
    // Mobile: temporary overlay drawer.
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => dispatch(setSidebar(false))}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { ...paperBase, width: layoutConfig.drawerWidth } }}
      >
        {renderList(false, () => dispatch(setSidebar(false)))}
      </Drawer>
    );
  }

  // Desktop: permanent drawer that collapses to an icon rail.
  const mini = !sidebarOpen;
  const width = mini ? layoutConfig.miniDrawerWidth : layoutConfig.drawerWidth;

  // Animate BOTH the docked root (which reserves layout space) and the paper
  // with the same transition, so the sidebar and the main content shift in
  // sync — otherwise the content would jump while the paper slid.
  const widthTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  });

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: widthTransition,
        '& .MuiDrawer-paper': {
          ...paperBase,
          // Pin all three so the rail can't be widened by its own content
          // (a flex item's intrinsic min-content otherwise keeps it expanded).
          width,
          minWidth: width,
          maxWidth: width,
          transition: widthTransition,
        },
      }}
    >
      {renderList(mini)}
    </Drawer>
  );
}

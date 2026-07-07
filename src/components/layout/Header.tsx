'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  ButtonBase,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleSidebar } from '@/redux/slices/uiSlice';
import { logout } from '@/redux/slices/authSlice';
import { clearSession } from '@/lib/authStorage';
import { appConfig, layoutConfig } from '@/config';
import Breadcrumbs from './Breadcrumbs';
import ThemeToggle from './ThemeToggle';

/**
 * Top header bar for the content column: sidebar toggle + breadcrumb trail on
 * the left, notifications, theme switch and the user menu on the right.
 *
 * It sticks to the top of the main column (the brand lives in the sidebar), so
 * it spans the content area beside the drawer rather than across the whole app.
 */
export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogout = () => {
    setAnchorEl(null);
    clearSession();
    dispatch(logout());
    router.replace(appConfig.routes.login);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        height: layoutConfig.headerHeight,
        justifyContent: 'center',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle sidebar"
          onClick={() => dispatch(toggleSidebar())}
        >
          <MenuIcon />
        </IconButton>

        <Breadcrumbs />

        <Box sx={{ flexGrow: 1 }} />

        <ThemeToggle />

        <Tooltip title="Notifications">
          <IconButton color="inherit" aria-label="notifications">
            <Badge color="error" variant="dot" overlap="circular">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <ButtonBase
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="account menu"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: 2,
            p: 0.5,
            pr: 1,
            ml: 0.5,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name ?? 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role ?? ''}
            </Typography>
          </Box>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 16 }}>
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </Avatar>
          <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
        </ButtonBase>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{user?.name ?? 'User'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.username ?? ''}
            </Typography>
          </Box>
          <Divider />
          <MenuItem disabled>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

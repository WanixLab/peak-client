'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import { Box, Button, Card, CardContent, MenuItem, Stack, TextField } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchField from './SearchField';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSpec {
  /** Stable key (used for React keys). */
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  /** Column width; defaults to 160. */
  minWidth?: number;
}

export interface FilterBarProps {
  /** Dropdown filters, rendered left-to-right. */
  filters?: FilterSpec[];
  /** Search box config. Omit to hide the search field. */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Search box min width on md+. Defaults to 280. */
    minWidth?: number;
  };
  /**
   * When provided, a "Reset" button appears (enabled only when `active`) and
   * calls this to clear every filter. Pair with `active` to control its state.
   */
  onReset?: () => void;
  /** Whether any filter is currently narrowing results — drives the Reset button. */
  active?: boolean;
  /** Extra controls pinned to the right of the search box (e.g. a view toggle). */
  actions?: ReactNode;
  /** Render bare (no wrapping Card), e.g. inside an existing toolbar. */
  disableCard?: boolean;
}

/**
 * The shared filter/search toolbar for list screens. Pass a declarative list of
 * dropdown `filters` plus an optional `search` config and it lays them out in
 * the app's standard card toolbar — filters on the left, search pinned right,
 * with an optional Reset button. Everything stays controlled by the caller, so
 * the component holds no state of its own and drops into any page in a few
 * lines instead of the usual hand-rolled `TextField` row.
 */
export default function FilterBar({
  filters = [],
  search,
  onReset,
  active = false,
  actions,
  disableCard = false,
}: FilterBarProps) {
  const inner = (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ alignItems: { md: 'center' } }}
    >
      {filters.map((f) => (
        <TextField
          key={f.key}
          select
          size="small"
          label={f.label}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          sx={{ minWidth: f.minWidth ?? 160, width: { xs: '100%', md: 'auto' } }}
        >
          {f.options.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      ))}

      {onReset && (
        <Button
          size="small"
          color="inherit"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          disabled={!active}
          sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, flexShrink: 0 }}
        >
          Reset
        </Button>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {actions}

      {search && (
        <SearchField
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
          sx={{ minWidth: { xs: '100%', md: search.minWidth ?? 280 } }}
        />
      )}
    </Stack>
  );

  if (disableCard) return inner;

  return (
    <Card>
      <CardContent>{inner}</CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export interface SearchFieldProps
  extends Omit<TextFieldProps, 'value' | 'onChange' | 'size'> {
  /** Current query. Controlled. */
  value: string;
  /** Fires with the new query string (not the raw event) on every keystroke. */
  onChange: (value: string) => void;
  /** Fires when the clear (×) button is pressed. Defaults to `onChange('')`. */
  onClear?: () => void;
  size?: 'sm' | 'md';
}

const SIZE_MAP = { sm: 'small', md: 'medium' } as const;

/**
 * The shared search input for the whole app — a leading magnifier, a trailing
 * clear button that appears only when there's a query, and a string-first
 * `onChange` so callers never touch the raw event. Everything else on MUI's
 * `TextField` (placeholder, sx, fullWidth, autoFocus…) passes straight through.
 */
export default function SearchField({
  value,
  onChange,
  onClear,
  size = 'sm',
  placeholder = 'Search…',
  ...rest
}: SearchFieldProps) {
  const clear = onClear ?? (() => onChange(''));

  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      size={SIZE_MAP[size]}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="Clear search"
                size="small"
                edge="end"
                onClick={clear}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      {...rest}
    />
  );
}

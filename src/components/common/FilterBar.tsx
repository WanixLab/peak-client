'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  ListItemText,
  MenuItem,
  Popover,
  Stack,
  TextField,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Calendar, DateRangePicker, createStaticRanges } from 'react-date-range';
import type { RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import SearchField from './SearchField';

/** Brand primary — used to tint the react-date-range selection. */
const PRIMARY = '#6D28D9';

/** ISO `yyyy-mm-dd` ⇄ `Date` helpers so callers keep a plain-string API. */
const parseIso = (iso: string): Date | null => {
  if (!iso) return null;
  const d = parseISO(iso);
  return isValid(d) ? d : null;
};
const toIso = (d: Date | null | undefined): string => (d && isValid(d) ? format(d, 'yyyy-MM-dd') : '');

/** Preset ranges shown down the side of the range calendar. */
const rangeShortcuts = createStaticRanges([
  {
    label: 'This Week',
    range: () => ({ startDate: startOfWeek(new Date()), endDate: endOfWeek(new Date()) }),
  },
  {
    label: 'Last Week',
    range: () => {
      const p = addDays(new Date(), -7);
      return { startDate: startOfWeek(p), endDate: endOfWeek(p) };
    },
  },
  {
    label: 'Last 7 Days',
    range: () => ({ startDate: addDays(new Date(), -6), endDate: new Date() }),
  },
  {
    label: 'Current Month',
    range: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }),
  },
  {
    label: 'Next Month',
    range: () => {
      const s = addDays(endOfMonth(new Date()), 1);
      return { startDate: s, endDate: endOfMonth(s) };
    },
  },
]);

/**
 * Re-skins react-date-range to the app theme: transparent surfaces that inherit
 * the popover's paper, text/borders bound to the MUI CSS variables (so it flips
 * with light/dark), and the noisy built-in date display / numeric inputs hidden.
 */
const pickerSx: SxProps<Theme> = {
  '& .rdrCalendarWrapper, & .rdrDateRangePickerWrapper, & .rdrDateDisplayWrapper, & .rdrMonthAndYearWrapper, & .rdrMonths, & .rdrMonth, & .rdrWeekDays, & .rdrDays, & .rdrDefinedRangesWrapper':
    { background: 'transparent', color: 'var(--mui-palette-text-primary)' },
  '& .rdrCalendarWrapper': { fontFamily: 'inherit' },
  '& .rdrInputRanges': { display: 'none' },
  '& .rdrMonthName, & .rdrWeekDay': { color: 'var(--mui-palette-text-secondary)' },
  '& .rdrMonthPicker select, & .rdrYearPicker select': {
    color: 'var(--mui-palette-text-primary)',
  },
  '& .rdrMonthAndYearPickers select:hover': {
    background: 'var(--mui-palette-action-hover)',
  },
  '& .rdrDayNumber span': { color: 'var(--mui-palette-text-primary)' },
  '& .rdrDayPassive .rdrDayNumber span, & .rdrDayDisabled .rdrDayNumber span': {
    color: 'var(--mui-palette-text-disabled)',
  },
  '& .rdrDayToday .rdrDayNumber span:after': { background: PRIMARY },
  '& .rdrNextPrevButton': {
    background: 'var(--mui-palette-action-hover)',
    '&:hover': { background: 'var(--mui-palette-action-selected)' },
  },
  '& .rdrPprevButton i': { borderColor: 'transparent var(--mui-palette-text-secondary) transparent transparent' },
  '& .rdrNextButton i': { borderColor: 'transparent transparent transparent var(--mui-palette-text-secondary)' },
  '& .rdrDefinedRangesWrapper': { borderColor: 'var(--mui-palette-divider)' },
  '& .rdrStaticRange': {
    background: 'transparent',
    borderColor: 'var(--mui-palette-divider)',
    '&:hover .rdrStaticRangeLabel, &:focus .rdrStaticRangeLabel': {
      background: 'var(--mui-palette-action-hover)',
    },
  },
  '& .rdrStaticRangeLabel': { color: 'var(--mui-palette-text-primary)' },
};

export interface FilterOption {
  value: string;
  label: string;
}

/** Fields shared by every filter kind. */
interface BaseFilter {
  /** Stable key (used for React keys). */
  key: string;
  label: string;
  /** Control width; sensible per-kind default when omitted. */
  minWidth?: number;
}

/** A single-choice dropdown — the default when `type` is omitted. */
export interface SelectFilter extends BaseFilter {
  type?: 'select';
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

/** A multi-choice dropdown with checkboxes; value is the list of picked values. */
export interface MultiSelectFilter extends BaseFilter {
  type: 'multiselect';
  value: string[];
  onChange: (value: string[]) => void;
  options: FilterOption[];
}

/** A single date, held as an ISO `yyyy-mm-dd` string (empty = unset). */
export interface DateFilter extends BaseFilter {
  type: 'date';
  value: string;
  onChange: (value: string) => void;
}

/** A from/to date range, each side an ISO `yyyy-mm-dd` string (empty = open). */
export interface DateRangeValue {
  from: string;
  to: string;
}
export interface DateRangeFilter extends BaseFilter {
  type: 'daterange';
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

export type FilterSpec =
  | SelectFilter
  | MultiSelectFilter
  | DateFilter
  | DateRangeFilter;

export interface FilterBarProps {
  /** Filters, rendered after the search box (any mix of kinds). */
  filters?: FilterSpec[];
  /** Search box config. Omit to hide the search field. */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Search box width on md+. Defaults to 320. */
    minWidth?: number;
  };
  /**
   * When provided, a "Reset" button appears (enabled only when `active`) and
   * calls this to clear every filter. Pair with `active` to control its state.
   */
  onReset?: () => void;
  /** Whether any filter is currently narrowing results — drives the Reset button. */
  active?: boolean;
  /** Extra controls pinned to the far right (e.g. a view toggle). */
  actions?: ReactNode;
  /** Render bare (no wrapping Card), e.g. inside an existing toolbar. */
  disableCard?: boolean;
}

/**
 * A soft, filled field look shared by the search box and every control so the
 * whole toolbar reads as one cohesive strip: no hard outline at rest, a gentle
 * tint on hover, and a crisp primary ring only on focus.
 */
const fieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: 'var(--mui-palette-action-hover)',
    transition: 'background-color .15s ease, box-shadow .15s ease',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover': { backgroundColor: 'var(--mui-palette-action-selected)' },
    '&:hover fieldset': { borderColor: 'transparent' },
    '&.Mui-focused': { backgroundColor: 'transparent' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
};

/** A `Button` styled to sit in the strip exactly like the filled fields above. */
const fieldButtonSx: SxProps<Theme> = {
  height: 40,
  borderRadius: 2,
  px: 1.5,
  justifyContent: 'flex-start',
  textTransform: 'none',
  fontWeight: 500,
  color: 'text.primary',
  backgroundColor: 'var(--mui-palette-action-hover)',
  border: '1px solid transparent',
  '&:hover': { backgroundColor: 'var(--mui-palette-action-selected)' },
};

/** The elevated, rounded menu shell shared by every dropdown. */
const menuPaperBase = {
  mt: 1,
  borderRadius: 2,
  minWidth: 200,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.24)',
  backgroundImage: 'none',
  '& .MuiList-root': { py: 0.5 },
  '& .MuiMenuItem-root': {
    mx: 0.75,
    my: 0.25,
    px: 1.25,
    borderRadius: 1.5,
    fontSize: 14,
    fontWeight: 500,
    minHeight: 40,
    transition: 'background-color .12s ease',
  },
} as const;

/** Single-select menu: the chosen row fills with the primary colour. */
const menuProps = {
  slotProps: {
    paper: {
      sx: {
        ...menuPaperBase,
        '& .MuiMenuItem-root.Mui-selected': {
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 600,
          '&:hover': { backgroundColor: 'primary.dark' },
        },
      },
    },
  },
} as const;

/** Multi-select menu: checkboxes carry the state, so rows stay neutral. */
const menuPropsMulti = {
  slotProps: {
    paper: {
      sx: {
        ...menuPaperBase,
        '& .MuiMenuItem-root': { ...menuPaperBase['& .MuiMenuItem-root'], pl: 0.5 },
        '& .MuiMenuItem-root.Mui-selected': {
          backgroundColor: 'var(--mui-palette-action-hover)',
          '&:hover': { backgroundColor: 'var(--mui-palette-action-selected)' },
        },
      },
    },
  },
} as const;

function SelectFilterField({ f }: { f: SelectFilter }) {
  return (
    <TextField
      select
      size="small"
      label={f.label}
      value={f.value}
      onChange={(e) => f.onChange(e.target.value)}
      sx={{ ...fieldSx, minWidth: f.minWidth ?? 160, width: { xs: '100%', md: 'auto' } }}
      slotProps={{ select: { MenuProps: menuProps } }}
    >
      {f.options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function MultiSelectFilterField({ f }: { f: MultiSelectFilter }) {
  const labelFor = (v: string) => f.options.find((o) => o.value === v)?.label ?? v;
  return (
    <TextField
      select
      size="small"
      label={f.label}
      value={f.value}
      onChange={(e) => {
        const v = e.target.value as unknown as string[];
        f.onChange(typeof v === 'string' ? (v as string).split(',') : v);
      }}
      sx={{ ...fieldSx, minWidth: f.minWidth ?? 180, width: { xs: '100%', md: 'auto' } }}
      slotProps={{
        select: {
          multiple: true,
          displayEmpty: true,
          MenuProps: menuPropsMulti,
          renderValue: (selected) => {
            const arr = (selected as string[]) ?? [];
            if (arr.length === 0)
              return <Box component="span" sx={{ color: 'text.secondary' }}>All</Box>;
            if (arr.length === 1) return labelFor(arr[0]);
            return `${arr.length} selected`;
          },
        },
        inputLabel: { shrink: true },
      }}
    >
      {f.options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          <Checkbox size="small" checked={f.value.includes(o.value)} sx={{ mr: 1, p: 0.5 }} />
          <ListItemText primary={o.label} slotProps={{ primary: { sx: { fontSize: 14 } } }} />
        </MenuItem>
      ))}
    </TextField>
  );
}

/** Rounded, themed shell shared by both date popovers. */
const datePopoverPaperSx: SxProps<Theme> = {
  mt: 1,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.24)',
  backgroundImage: 'none',
  overflow: 'hidden',
};

function DateFilterField({ f }: { f: DateFilter }) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const selected = parseIso(f.value);
  const summary = f.value || f.label;

  return (
    <>
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        startIcon={<CalendarTodayIcon fontSize="small" />}
        sx={{
          ...fieldButtonSx,
          minWidth: f.minWidth ?? 170,
          width: { xs: '100%', md: 'auto' },
          color: f.value ? 'text.primary' : 'text.secondary',
        }}
      >
        {summary}
      </Button>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: datePopoverPaperSx } }}
      >
        <Box sx={pickerSx}>
          <Calendar
            date={selected ?? new Date()}
            onChange={(d: Date) => {
              f.onChange(toIso(d));
              setAnchor(null);
            }}
            color={PRIMARY}
          />
        </Box>
        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'flex-end', p: 1.5 }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              f.onChange('');
              setAnchor(null);
            }}
            disabled={!f.value}
            sx={{ color: 'text.secondary' }}
          >
            Clear
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

function DateRangeFilterField({ f }: { f: DateRangeFilter }) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const { from, to } = f.value;
  const hasValue = Boolean(from || to);
  const summary = hasValue ? `${from || '…'} → ${to || '…'}` : f.label;
  const start = parseIso(from);
  const end = parseIso(to);
  const ranges = [
    { startDate: start ?? new Date(), endDate: end ?? start ?? new Date(), key: 'selection' },
  ];

  return (
    <>
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        startIcon={<DateRangeIcon fontSize="small" />}
        sx={{
          ...fieldButtonSx,
          minWidth: f.minWidth ?? 200,
          width: { xs: '100%', md: 'auto' },
          color: hasValue ? 'text.primary' : 'text.secondary',
        }}
      >
        {summary}
      </Button>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: datePopoverPaperSx } }}
      >
        <Box sx={pickerSx}>
          <DateRangePicker
            ranges={ranges}
            onChange={(item: RangeKeyDict) => {
              const sel = item.selection;
              f.onChange({ from: toIso(sel.startDate), to: toIso(sel.endDate) });
            }}
            months={1}
            direction="horizontal"
            showDateDisplay={false}
            staticRanges={rangeShortcuts}
            inputRanges={[]}
            rangeColors={[PRIMARY]}
            color={PRIMARY}
          />
        </Box>
        <Divider />
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', p: 1.5 }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => f.onChange({ from: '', to: '' })}
            disabled={!hasValue}
            sx={{ color: 'text.secondary' }}
          >
            Clear
          </Button>
          <Button size="small" variant="contained" onClick={() => setAnchor(null)}>
            Done
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

/** Dispatches a single filter spec to the field that renders its kind. */
function FilterField({ f }: { f: FilterSpec }) {
  switch (f.type) {
    case 'multiselect':
      return <MultiSelectFilterField f={f} />;
    case 'date':
      return <DateFilterField f={f} />;
    case 'daterange':
      return <DateRangeFilterField f={f} />;
    default:
      return <SelectFilterField f={f} />;
  }
}

/**
 * The shared filter/search toolbar for list screens. Pass a declarative list of
 * `filters` (single-select, multi-select, date or date-range) plus an optional
 * `search` config and it lays them out in the app's standard card toolbar — the
 * search box pinned left, the filters flowing after it and wrapping as needed,
 * and an optional Reset button. Everything stays controlled by the caller, so
 * the component holds no state of its own and drops into any page in a few lines
 * instead of the usual hand-rolled `TextField` row.
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        flexWrap: { md: 'wrap' },
        alignItems: { md: 'center' },
        gap: 1.5,
      }}
    >
      {search && (
        <SearchField
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
          sx={{ ...fieldSx, width: { xs: '100%', md: search.minWidth ?? 320 }, flexShrink: 0 }}
        />
      )}

      {filters.map((f) => (
        <FilterField key={f.key} f={f} />
      ))}

      {onReset && (
        <Button
          size="small"
          color="inherit"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          disabled={!active}
          sx={{
            alignSelf: { xs: 'flex-start', md: 'center' },
            flexShrink: 0,
            borderRadius: 2,
            px: 1.5,
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'var(--mui-palette-action-hover)' },
          }}
        >
          Reset
        </Button>
      )}

      {actions && <Box sx={{ ml: { md: 'auto' } }}>{actions}</Box>}
    </Box>
  );

  if (disableCard) return inner;

  return (
    <Card>
      <CardContent>{inner}</CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import ApexChart from './ApexChart';

export interface CategoryDatum {
  label: string;
  value: number;
  /** Per-bar colour. When omitted for every datum, the single `color` is used. */
  color?: string;
}

/**
 * A flexible categorical bar chart (ApexCharts) for counts or percentages —
 * vertical columns by default, horizontal when `horizontal`. Bars can share one
 * `color` or carry their own (`datum.color`, distributed). Axis/grid colours
 * track the MUI theme for light/dark mode.
 */
export default function CategoryBarChart({
  data,
  color,
  horizontal = false,
  height = 280,
  max,
  valueSuffix = '',
}: {
  data: CategoryDatum[];
  /** Fallback bar colour when data carry no per-bar colour. */
  color: string;
  horizontal?: boolean;
  height?: number;
  /** Fixed axis maximum (e.g. 100 for percentages). */
  max?: number;
  /** Appended to data labels and tooltips, e.g. `'%'`. */
  valueSuffix?: string;
}) {
  const theme = useTheme();
  const perBar = data.some((d) => d.color);
  const colors = perBar ? data.map((d) => d.color ?? color) : [color];
  const fmt = (v: number) => `${Math.round(v)}${valueSuffix}`;

  const options = React.useMemo<ApexOptions>(
    () => ({
      chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal,
          distributed: perBar,
          borderRadius: 6,
          borderRadiusApplication: 'end',
          columnWidth: '58%',
          barHeight: '62%',
          dataLabels: { position: horizontal ? 'center' : 'top' },
        },
      },
      colors,
      dataLabels: {
        enabled: true,
        offsetY: horizontal ? 0 : -20,
        formatter: (v) => fmt(Number(v)),
        style: {
          colors: [horizontal ? '#fff' : theme.palette.text.primary],
          fontWeight: 700,
          fontSize: '12px',
        },
      },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4, padding: { top: 8 } },
      // The numeric (value) axis is x when horizontal, y otherwise — format only
      // that side so category labels stay as text (avoids NaN on the label axis).
      xaxis: {
        categories: data.map((d) => d.label),
        labels: {
          style: { colors: theme.palette.text.secondary },
          ...(horizontal ? { formatter: (v: string) => fmt(Number(v)) } : {}),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        ...(horizontal && max != null ? { max } : {}),
      },
      yaxis: {
        ...(!horizontal && max != null ? { min: 0, max } : {}),
        labels: {
          style: { colors: theme.palette.text.secondary },
          ...(horizontal ? {} : { formatter: (v: number) => fmt(Number(v)) }),
        },
      },
      legend: { show: false },
      states: { active: { filter: { type: 'none' } } },
      tooltip: {
        theme: theme.palette.mode,
        y: { formatter: (v) => fmt(Number(v)) },
      },
      theme: { mode: theme.palette.mode },
    }),
    [data, colors, perBar, horizontal, max, theme.palette.mode, theme.palette.text, theme.palette.divider],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <ApexChart
        type="bar"
        options={options}
        series={[{ name: 'value', data: data.map((d) => d.value) }]}
        height={height}
        width="100%"
      />
    </Box>
  );
}

'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import ApexChart from './ApexChart';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * Donut chart (ApexCharts). Colours come from the caller (use `@/theme/accents`)
 * and axis/label colours track the MUI theme, so it reads correctly in both
 * light and dark mode. The centre shows `centerValue` / `centerLabel`.
 */
export default function DonutChart({
  segments,
  size = 200,
  thickness = 24,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
}) {
  const theme = useTheme();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  // Inner hole diameter as a % of the chart, derived from the ring thickness.
  const holeSize = `${Math.max(40, Math.round(((size - 2 * thickness) / size) * 100))}%`;

  const options = React.useMemo<ApexOptions>(
    () => ({
      chart: { type: 'donut', background: 'transparent' },
      labels: segments.map((s) => s.label),
      colors: segments.map((s) => s.color),
      stroke: { width: 0 },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: { theme: theme.palette.mode, y: { formatter: (v) => String(v) } },
      plotOptions: {
        pie: {
          donut: {
            size: holeSize,
            labels: {
              show: centerValue != null || centerLabel != null,
              value: {
                show: true,
                offsetY: -14,
                color: theme.palette.text.primary,
                fontSize: '26px',
                fontWeight: 700,
              },
              total: {
                show: true,
                showAlways: true,
                label: centerLabel != null ? String(centerLabel) : '',
                color: theme.palette.text.secondary,
                fontSize: '12px',
                formatter: () => (centerValue != null ? String(centerValue) : String(total)),
              },
            },
          },
        },
      },
      theme: { mode: theme.palette.mode },
    }),
    [segments, holeSize, centerValue, centerLabel, total, theme.palette.mode, theme.palette.text],
  );

  return (
    <Box sx={{ width: size, height: size, flexShrink: 0 }}>
      <ApexChart
        type="donut"
        options={options}
        series={segments.map((s) => s.value)}
        width={size}
        height={size}
      />
    </Box>
  );
}

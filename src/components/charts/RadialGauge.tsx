'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import ApexChart from './ApexChart';

/**
 * Single-value radial gauge (ApexCharts `radialBar`). Shows a 0–100 value as a
 * filled arc with the number in the centre; track and label colours track the
 * MUI theme so it reads in light and dark mode.
 */
export default function RadialGauge({
  value,
  label,
  color,
  height = 260,
}: {
  /** 0–100 percentage that fills the arc. */
  value: number;
  /** Caption under the big number. */
  label?: string;
  color: string;
  height?: number;
}) {
  const theme = useTheme();

  const options = React.useMemo<ApexOptions>(
    () => ({
      chart: { type: 'radialBar', background: 'transparent', sparkline: { enabled: true } },
      colors: [color],
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: { size: '62%' },
          track: { background: alpha(theme.palette.text.primary, 0.08), strokeWidth: '100%' },
          dataLabels: {
            name: {
              show: Boolean(label),
              offsetY: 26,
              color: theme.palette.text.secondary,
              fontSize: '13px',
              fontWeight: 500,
            },
            value: {
              offsetY: -14,
              color: theme.palette.text.primary,
              fontSize: '34px',
              fontWeight: 800,
              formatter: (v) => `${Math.round(Number(v))}%`,
            },
          },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: theme.palette.mode,
          type: 'horizontal',
          gradientToColors: [alpha(color, 0.6)],
          stops: [0, 100],
        },
      },
      stroke: { lineCap: 'round' },
      labels: label ? [label] : [],
      theme: { mode: theme.palette.mode },
    }),
    [color, label, theme.palette.mode, theme.palette.text],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <ApexChart type="radialBar" options={options} series={[Math.round(value)]} height={height} width="100%" />
    </Box>
  );
}

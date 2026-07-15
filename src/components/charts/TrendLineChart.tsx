'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import ApexChart from './ApexChart';

export interface TrendPoint {
  label: string;
  value: number;
}

/**
 * Area/line trend chart (ApexCharts). The line uses the caller-supplied accent
 * colour; grid, axes and markers track the MUI theme for light/dark mode.
 */
export default function TrendLineChart({
  points,
  color,
  min = 0,
  max = 100,
  height = 260,
}: {
  points: TrendPoint[];
  color: string;
  min?: number;
  max?: number;
  height?: number;
}) {
  const theme = useTheme();

  const options = React.useMemo<ApexOptions>(
    () => ({
      chart: {
        type: 'area',
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: [color],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.04, stops: [0, 100] },
      },
      dataLabels: {
        enabled: true,
        formatter: (v) => String(v),
        background: { enabled: false },
        offsetY: -4,
        style: { colors: [color], fontWeight: 600, fontSize: '11px' },
      },
      markers: {
        size: 4,
        colors: [color],
        strokeColors: theme.palette.background.paper,
        strokeWidth: 2,
        hover: { size: 6 },
      },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      xaxis: {
        categories: points.map((p) => p.label),
        labels: { style: { colors: theme.palette.text.secondary } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min,
        max,
        labels: {
          formatter: (v) => String(Math.round(v)),
          style: { colors: theme.palette.text.secondary },
        },
      },
      legend: { show: false },
      tooltip: { theme: theme.palette.mode },
      theme: { mode: theme.palette.mode },
    }),
    [points, color, min, max, theme.palette.mode, theme.palette.text, theme.palette.divider, theme.palette.background.paper],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <ApexChart
        type="area"
        options={options}
        series={[{ name: 'Avg Score', data: points.map((p) => p.value) }]}
        height={height}
        width="100%"
      />
    </Box>
  );
}

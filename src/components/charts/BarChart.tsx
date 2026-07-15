'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import ApexChart from './ApexChart';

export interface BarDatum {
  id: string;
  label: string;
  /** Value as a percentage (0–100) — drives the bar height. */
  value: number;
  color: string;
  /** Optional tooltip text shown on hover. */
  caption?: string;
}

/**
 * Vertical bar chart (ApexCharts). Bars are individually coloured (distributed)
 * and clickable when `onSelect` is provided — the dashboard uses that for
 * drill-down. The selected bar keeps its colour while the rest dim.
 */
export default function BarChart({
  data,
  height = 220,
  onSelect,
  selectedId,
}: {
  data: BarDatum[];
  height?: number;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}) {
  const theme = useTheme();

  const colors = data.map((d) =>
    !selectedId || d.id === selectedId ? d.color : alpha(d.color, 0.35),
  );

  const options = React.useMemo<ApexOptions>(
    () => ({
      chart: {
        type: 'bar',
        background: 'transparent',
        toolbar: { show: false },
        events: onSelect
          ? {
              dataPointSelection: (_event, _ctx, config) => {
                const index = config?.dataPointIndex;
                const datum = typeof index === 'number' ? data[index] : undefined;
                if (datum) onSelect(datum.id);
              },
            }
          : undefined,
      },
      plotOptions: {
        bar: {
          distributed: true,
          borderRadius: 6,
          borderRadiusApplication: 'end',
          columnWidth: '55%',
          dataLabels: { position: 'top' },
        },
      },
      colors,
      dataLabels: {
        enabled: true,
        offsetY: -20,
        formatter: (v) => `${Math.round(Number(v))}%`,
        style: { colors: [theme.palette.text.primary], fontWeight: 700, fontSize: '12px' },
      },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4, padding: { top: 12 } },
      xaxis: {
        categories: data.map((d) => d.label),
        labels: { style: { colors: data.map(() => theme.palette.text.secondary) } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: {
          formatter: (v) => `${Math.round(v)}%`,
          style: { colors: theme.palette.text.secondary },
        },
      },
      legend: { show: false },
      states: { active: { filter: { type: 'none' } } },
      tooltip: {
        theme: theme.palette.mode,
        custom: ({ dataPointIndex }) => {
          const d = data[dataPointIndex];
          const detail = d.caption ?? `${d.value}%`;
          return `<div style="padding:6px 10px;font-size:12px"><strong>${d.label}</strong><br/>${detail}</div>`;
        },
      },
      theme: { mode: theme.palette.mode },
    }),
    [data, colors, onSelect, theme.palette.mode, theme.palette.text, theme.palette.divider],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <ApexChart
        type="bar"
        options={options}
        series={[{ name: 'Completion', data: data.map((d) => d.value) }]}
        height={height}
        width="100%"
      />
    </Box>
  );
}

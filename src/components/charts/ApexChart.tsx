'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { Props } from 'react-apexcharts';

/**
 * `react-apexcharts` touches `window` at module load, so it can't be
 * server-rendered. Loading it through `next/dynamic` with `ssr: false` keeps the
 * import client-only; every chart component in this folder renders through this
 * shared wrapper. A fixed-height placeholder avoids layout shift before mount.
 */
const ApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
}) as ComponentType<Props>;

export default ApexChart;
export type { Props as ApexChartProps };

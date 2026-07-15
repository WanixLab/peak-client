'use client';

import SummaryCard, { type SummaryCardProps } from './SummaryCard';

/**
 * Backwards-compatible alias for {@link SummaryCard}.
 *
 * The original `StatTile` (label + value + trailing icon badge) has been
 * superseded by the modern, multi-variant {@link SummaryCard}, which leads with
 * the icon. This wrapper keeps the old import path and prop shape working so
 * every existing screen picks up the new look without changes — reach for
 * `SummaryCard` directly in new code to use its variants, trend and progress.
 */
export type StatTileProps = Pick<SummaryCardProps, 'label' | 'value' | 'icon' | 'color' | 'hint'>;

export default function StatTile(props: StatTileProps) {
  return <SummaryCard {...props} />;
}

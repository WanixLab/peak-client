'use client';

import * as React from 'react';
import { Box, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import DonutChart from '@/components/charts/DonutChart';
import TrendLineChart from '@/components/charts/TrendLineChart';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import RadialGauge from '@/components/charts/RadialGauge';
import { ACCENT } from '@/theme/accents';
import {
  SCORE_ENTRIES,
  SCORE_TERMS,
  EVAL_TYPE_META,
  gradeFor,
  type EvalType,
  type ScoreEntry,
} from '@/data/scores';
import { ORGANIZATION, subjectByCode, departmentName, facultyOfDepartment } from '@/data/academicData';

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

const EVAL_TYPES = Object.keys(EVAL_TYPE_META) as EvalType[];

/** Grade buckets in display order, each with an accent that matches gradeFor. */
const GRADE_META: { grade: string; color: string }[] = [
  { grade: 'A', color: ACCENT.green },
  { grade: 'B+', color: ACCENT.green },
  { grade: 'B', color: ACCENT.cyan },
  { grade: 'C+', color: ACCENT.amber },
  { grade: 'C', color: ACCENT.amber },
  { grade: 'D', color: ACCENT.pink },
  { grade: 'F', color: ACCENT.pink },
];

/** subjectCode → its department / faculty, resolved once from academic data. */
const SUBJECT_META = new Map<string, { deptName: string; facultyId?: string }>();
for (const code of new Set(SCORE_ENTRIES.map((e) => e.subjectCode))) {
  const subj = subjectByCode(code);
  const deptId = subj?.departmentId;
  const fac = deptId ? facultyOfDepartment(deptId) : undefined;
  SUBJECT_META.set(code, { deptName: deptId ? departmentName(deptId) : 'อื่น ๆ', facultyId: fac?.id });
}
const facultyOfEntry = (e: ScoreEntry) => SUBJECT_META.get(e.subjectCode)?.facultyId;
const deptOfEntry = (e: ScoreEntry) => SUBJECT_META.get(e.subjectCode)?.deptName ?? 'อื่น ๆ';

/** A coloured legend dot + label + value row shown beside a donut. */
function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
}

/** Section card with a title, optional caption, and chart body. */
function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {caption && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
              {caption}
            </Typography>
          )}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [faculty, setFaculty] = React.useState('all');
  const [term, setTerm] = React.useState('all');
  const [refreshedAt, setRefreshedAt] = React.useState<Date | null>(null);

  React.useEffect(() => setRefreshedAt(new Date()), []);

  // Entries in the selected faculty (all terms) — used for the term trend.
  const facultyEntries = React.useMemo(
    () => (faculty === 'all' ? SCORE_ENTRIES : SCORE_ENTRIES.filter((e) => facultyOfEntry(e) === faculty)),
    [faculty],
  );
  // Fully filtered set (faculty + term) — drives everything except the trend.
  const entries = React.useMemo(
    () => (term === 'all' ? facultyEntries : facultyEntries.filter((e) => e.term === term)),
    [facultyEntries, term],
  );

  const agg = React.useMemo(() => {
    const total = entries.length;
    const submitted = entries.filter((e) => e.status === 'submitted').length;
    const pending = total - submitted;
    const scored = entries.filter((e) => e.scorePercent != null).map((e) => e.scorePercent as number);
    const passed = entries.filter((e) => e.scorePercent != null && (e.scorePercent as number) >= e.passThreshold).length;
    return {
      total,
      submitted,
      pending,
      progress: pct(submitted, total),
      avg: mean(scored),
      passRate: scored.length ? pct(passed, scored.length) : 0,
      targets: new Set(entries.map((e) => e.target)).size,
      subjects: new Set(entries.map((e) => e.subjectCode)).size,
      evaluators: new Set(entries.map((e) => e.evaluator)).size,
    };
  }, [entries]);

  // Average score by term (trend) — ascending, only terms with submitted scores.
  const trend = React.useMemo(() => {
    const terms = Array.from(new Set(facultyEntries.map((e) => e.term))).sort();
    return terms
      .map((t) => {
        const scored = facultyEntries
          .filter((e) => e.term === t && e.scorePercent != null)
          .map((e) => e.scorePercent as number);
        return { label: t, value: scored.length ? Math.round(mean(scored)) : 0 };
      })
      .filter((p) => p.value > 0);
  }, [facultyEntries]);

  // Status donut segments.
  const statusSegments = React.useMemo(
    () => [
      { label: 'ส่งแล้ว', value: agg.submitted, color: ACCENT.green },
      { label: 'รอประเมิน', value: agg.pending, color: ACCENT.amber },
    ],
    [agg],
  );

  // Evaluation-type donut segments.
  const evalTypeSegments = React.useMemo(
    () =>
      EVAL_TYPES.map((t) => ({
        label: EVAL_TYPE_META[t].label,
        value: entries.filter((e) => e.evalType === t).length,
        color: EVAL_TYPE_META[t].color,
      })).filter((s) => s.value > 0),
    [entries],
  );

  // Completion % by subject (descending).
  const completionBySubject = React.useMemo(() => {
    const codes = Array.from(new Set(entries.map((e) => e.subjectCode)));
    return codes
      .map((code) => {
        const list = entries.filter((e) => e.subjectCode === code);
        const submitted = list.filter((e) => e.status === 'submitted').length;
        return { label: code, value: pct(submitted, list.length) };
      })
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  // Grade distribution (counts across submitted, graded tasks).
  const gradeDist = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      if (e.scorePercent == null) continue;
      const g = gradeFor(e.scorePercent).grade;
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return GRADE_META.map((m) => ({ label: m.grade, value: counts.get(m.grade) ?? 0, color: m.color }));
  }, [entries]);

  // Average score by department (descending, submitted only).
  const avgByDept = React.useMemo(() => {
    const depts = Array.from(new Set(entries.map(deptOfEntry)));
    return depts
      .map((name) => {
        const scored = entries
          .filter((e) => deptOfEntry(e) === name && e.scorePercent != null)
          .map((e) => e.scorePercent as number);
        return { label: name, value: scored.length ? Math.round(mean(scored)) : 0 };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  const facultyOptions = [
    { value: 'all', label: 'ทุกคณะ' },
    ...ORGANIZATION.map((f) => ({ value: f.id, label: f.name })),
  ];
  const filtersActive = faculty !== 'all' || term !== 'all';

  return (
    <Stack spacing={3}>
      <PageHeader
        title="แดชบอร์ด"
        description="ภาพรวมความคืบหน้าและผลการประเมินทั่วทั้งองค์กร — สรุปจากงานประเมินจริงทุกชิ้น"
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              อัปเดต {refreshedAt ? refreshedAt.toLocaleTimeString('th-TH') : '—'}
            </Typography>
            <Button variant="soft" color={ACCENT.violet} startIcon={RefreshIcon} onClick={() => setRefreshedAt(new Date())}>
              รีเฟรช
            </Button>
          </Stack>
        }
      />

      <FilterBar
        filters={[
          { key: 'faculty', label: 'คณะ', value: faculty, onChange: setFaculty, minWidth: 220, options: facultyOptions },
          {
            key: 'term',
            label: 'เทอม',
            value: term,
            onChange: setTerm,
            minWidth: 140,
            options: [{ value: 'all', label: 'ทุกเทอม' }, ...SCORE_TERMS.map((t) => ({ value: t, label: t }))],
          },
        ]}
        onReset={() => {
          setFaculty('all');
          setTerm('all');
        }}
        active={filtersActive}
        actions={
          <Typography variant="caption" color="text.secondary">
            {agg.total.toLocaleString()} งานประเมินในมุมมองนี้
          </Typography>
        }
      />

      {/* KPI row — large */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="ความคืบหน้ารวม" value={`${agg.progress}%`} icon={DonutLargeIcon} color={ACCENT.violet} caption={`ส่งแล้ว ${agg.submitted}/${agg.total} งาน`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="คะแนนเฉลี่ย" value={agg.avg.toFixed(1)} icon={GradeIcon} color={ACCENT.blue} caption="เฉพาะที่ส่งแล้ว" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="อัตราผ่าน" value={`${agg.passRate}%`} icon={TrendingUpIcon} color={ACCENT.green} caption="ตามเกณฑ์รูบริก" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="ผู้ถูกประเมิน" value={agg.targets} icon={GroupIcon} color={ACCENT.cyan} caption="รายชื่อ/ทีมไม่ซ้ำ" />
        </Grid>
      </Grid>

      {/* KPI row — compact */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard variant="compact" label="ส่งแล้ว" value={agg.submitted} icon={CheckCircleIcon} color={ACCENT.green} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard variant="compact" label="รอประเมิน" value={agg.pending} icon={HourglassEmptyIcon} color={ACCENT.amber} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard variant="compact" label="จำนวนวิชา" value={agg.subjects} icon={MenuBookIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard variant="compact" label="ผู้ประเมิน" value={agg.evaluators} icon={RateReviewIcon} color={ACCENT.pink} />
        </Grid>
      </Grid>

      {/* Gauge + score trend */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard title="ความคืบหน้าการประเมิน" caption={`${agg.submitted}/${agg.total}`}>
            <RadialGauge value={agg.progress} label="ส่งแล้ว" color={ACCENT.violet} />
            <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'center' }}>
              <LegendRow color={ACCENT.green} label="ส่งแล้ว" value={String(agg.submitted)} />
              <Box sx={{ width: 16 }} />
              <LegendRow color={ACCENT.amber} label="รอประเมิน" value={String(agg.pending)} />
            </Stack>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard title="แนวโน้มคะแนนเฉลี่ยรายเทอม" caption={faculty === 'all' ? 'ทุกคณะ' : facultyOptions.find((f) => f.value === faculty)?.label}>
            {trend.length > 0 ? (
              <TrendLineChart points={trend} color={ACCENT.violet} min={50} max={100} height={288} />
            ) : (
              <Box sx={{ height: 288, display: 'grid', placeItems: 'center' }}>
                <Typography color="text.secondary">ยังไม่มีคะแนนสำหรับช่วงที่เลือก</Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Completion by subject + eval-type donut */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard title="อัตราการประเมินเสร็จตามวิชา" caption="% งานที่ส่งแล้ว">
            <CategoryBarChart data={completionBySubject} color={ACCENT.blue} max={100} valueSuffix="%" height={300} />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard title="สัดส่วนตามรูปแบบการประเมิน">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'center' }}>
              <DonutChart segments={evalTypeSegments} centerValue={agg.total} centerLabel="งาน" />
              <Stack spacing={1.25} sx={{ flexGrow: 1, width: '100%' }}>
                {evalTypeSegments.map((s) => (
                  <LegendRow key={s.label} color={s.color} label={s.label} value={String(s.value)} />
                ))}
                <Divider />
                <LegendRow color="transparent" label="รวม" value={String(agg.total)} />
              </Stack>
            </Stack>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Grade distribution + average by department */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard title="การกระจายเกรด" caption="จำนวนงานที่ส่งแล้ว">
            <CategoryBarChart data={gradeDist} color={ACCENT.violet} height={300} />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard title="คะแนนเฉลี่ยตามสาขา" caption="เต็ม 100">
            {avgByDept.length > 0 ? (
              <CategoryBarChart data={avgByDept} color={ACCENT.cyan} horizontal max={100} height={300} />
            ) : (
              <Box sx={{ height: 300, display: 'grid', placeItems: 'center' }}>
                <Typography color="text.secondary">ยังไม่มีคะแนน</Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary">
        ข้อมูลสรุปจากงานประเมินจริงในระบบ · เชื่อมต่อ API รายงานเพื่อแสดงผลแบบเรียลไทม์
      </Typography>
    </Stack>
  );
}

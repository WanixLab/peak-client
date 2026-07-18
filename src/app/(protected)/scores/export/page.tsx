'use client';

import * as React from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import TableRowsIcon from '@mui/icons-material/TableRows';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import {
  SCORE_ENTRIES,
  SCORE_SUBJECTS,
  SCORE_TERMS,
  EVAL_TYPE_META,
  gradeFor,
  toCsv,
  downloadCsv,
  type EvalType,
  type ScoreEntry,
} from '@/data/scores';

const dateFmt = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
const EVAL_TYPES = Object.keys(EVAL_TYPE_META) as EvalType[];
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

type ReportType = 'raw' | 'byTarget' | 'bySubject';

const REPORTS: { id: ReportType; label: string; icon: typeof TableRowsIcon; color: string }[] = [
  { id: 'raw', label: 'รายการคะแนนทั้งหมด', icon: TableRowsIcon, color: ACCENT.violet },
  { id: 'byTarget', label: 'สรุปตามผู้ถูกประเมิน', icon: PersonIcon, color: ACCENT.blue },
  { id: 'bySubject', label: 'สรุปตามวิชา', icon: MenuBookIcon, color: ACCENT.cyan },
];

/** A cell for a 0–100 average, coloured by grade (or a muted dash when empty). */
function AvgCell({ value }: { value: number | null }) {
  if (value == null)
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  return (
    <Typography variant="body2" sx={{ fontWeight: 700, color: gradeFor(value).color, fontVariantNumeric: 'tabular-nums' }}>
      {value.toFixed(1)}
    </Typography>
  );
}

interface BuiltReport {
  columns: GridColDef[];
  rows: Record<string, string | number | null>[];
  csv: string;
}

/** Turn the filtered entries into the columns/rows/CSV for the chosen report. */
function buildReport(type: ReportType, entries: ScoreEntry[]): BuiltReport {
  if (type === 'byTarget') {
    const map = new Map<string, ScoreEntry[]>();
    for (const e of entries) map.set(e.target, [...(map.get(e.target) ?? []), e]);
    const rows = Array.from(map.entries()).map(([target, list], i) => {
      const scored = list.filter((e) => e.scorePercent != null);
      const avg = scored.length ? Math.round(mean(scored.map((e) => e.scorePercent as number)) * 10) / 10 : null;
      const passed = scored.filter((e) => (e.scorePercent as number) >= e.passThreshold).length;
      return {
        id: i,
        target,
        kind: list[0].targetKind === 'group' ? 'กลุ่ม' : 'รายบุคคล',
        evaluations: list.length,
        submitted: scored.length,
        avg,
        passRate: scored.length ? Math.round((passed / scored.length) * 100) : null,
      };
    });
    const columns: GridColDef[] = [
      { field: 'target', headerName: 'ผู้ถูกประเมิน', flex: 1.3, minWidth: 180 },
      { field: 'kind', headerName: 'ประเภท', width: 110 },
      { field: 'evaluations', headerName: 'การประเมิน', width: 120, type: 'number', align: 'center', headerAlign: 'center' },
      { field: 'submitted', headerName: 'ส่งแล้ว', width: 100, type: 'number', align: 'center', headerAlign: 'center' },
      {
        field: 'avg',
        headerName: 'คะแนนเฉลี่ย',
        width: 120,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        renderCell: (p: GridRenderCellParams) => <AvgCell value={p.value as number | null} />,
      },
      {
        field: 'passRate',
        headerName: 'อัตราผ่าน',
        width: 110,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        valueFormatter: (v: number | null) => (v == null ? '—' : `${v}%`),
      },
    ];
    const csv = toCsv(
      ['ผู้ถูกประเมิน', 'ประเภท', 'การประเมิน', 'ส่งแล้ว', 'คะแนนเฉลี่ย', 'อัตราผ่าน (%)'],
      rows.map((r) => [r.target, r.kind, r.evaluations, r.submitted, r.avg ?? '', r.passRate ?? '']),
    );
    return { columns, rows, csv };
  }

  if (type === 'bySubject') {
    const map = new Map<string, ScoreEntry[]>();
    for (const e of entries) map.set(e.subjectCode, [...(map.get(e.subjectCode) ?? []), e]);
    const rows = Array.from(map.entries()).map(([code, list], i) => {
      const scored = list.filter((e) => e.scorePercent != null);
      const avg = scored.length ? Math.round(mean(scored.map((e) => e.scorePercent as number)) * 10) / 10 : null;
      const passed = scored.filter((e) => (e.scorePercent as number) >= e.passThreshold).length;
      return {
        id: i,
        subjectCode: code,
        subject: list[0].subject,
        evaluations: list.length,
        submitted: scored.length,
        avg,
        passRate: scored.length ? Math.round((passed / scored.length) * 100) : null,
      };
    });
    const columns: GridColDef[] = [
      { field: 'subjectCode', headerName: 'รหัสวิชา', width: 110 },
      { field: 'subject', headerName: 'ชื่อวิชา', flex: 1.4, minWidth: 200 },
      { field: 'evaluations', headerName: 'การประเมิน', width: 120, type: 'number', align: 'center', headerAlign: 'center' },
      { field: 'submitted', headerName: 'ส่งแล้ว', width: 100, type: 'number', align: 'center', headerAlign: 'center' },
      {
        field: 'avg',
        headerName: 'คะแนนเฉลี่ย',
        width: 120,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        renderCell: (p: GridRenderCellParams) => <AvgCell value={p.value as number | null} />,
      },
      {
        field: 'passRate',
        headerName: 'อัตราผ่าน',
        width: 110,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        valueFormatter: (v: number | null) => (v == null ? '—' : `${v}%`),
      },
    ];
    const csv = toCsv(
      ['รหัสวิชา', 'ชื่อวิชา', 'การประเมิน', 'ส่งแล้ว', 'คะแนนเฉลี่ย', 'อัตราผ่าน (%)'],
      rows.map((r) => [r.subjectCode, r.subject, r.evaluations, r.submitted, r.avg ?? '', r.passRate ?? '']),
    );
    return { columns, rows, csv };
  }

  // raw
  const rows = entries.map((e) => ({
    id: e.id,
    target: e.target,
    subjectCode: e.subjectCode,
    subject: e.subject,
    evaluator: e.evaluator,
    evalType: EVAL_TYPE_META[e.evalType].label,
    term: e.term,
    scorePercent: e.scorePercent,
    status: e.status === 'submitted' ? 'ส่งแล้ว' : 'รอประเมิน',
    submittedAt: e.submittedAt,
  }));
  const columns: GridColDef[] = [
    { field: 'target', headerName: 'ผู้ถูกประเมิน', flex: 1.2, minWidth: 170 },
    { field: 'subjectCode', headerName: 'รหัสวิชา', width: 100 },
    { field: 'evaluator', headerName: 'ผู้ประเมิน', flex: 1, minWidth: 140 },
    { field: 'evalType', headerName: 'รูปแบบ', width: 120 },
    { field: 'term', headerName: 'เทอม', width: 90, align: 'center', headerAlign: 'center' },
    {
      field: 'scorePercent',
      headerName: 'คะแนน',
      width: 90,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (p: GridRenderCellParams) => <AvgCell value={p.value as number | null} />,
    },
    { field: 'status', headerName: 'สถานะ', width: 110 },
    {
      field: 'submittedAt',
      headerName: 'วันที่ส่ง',
      width: 120,
      valueFormatter: (v: string | null) => (v ? dateFmt.format(new Date(v)) : '—'),
    },
  ];
  const csv = toCsv(
    ['ผู้ถูกประเมิน', 'รหัสวิชา', 'วิชา', 'ผู้ประเมิน', 'รูปแบบ', 'เทอม', 'คะแนน', 'สถานะ', 'วันที่ส่ง'],
    rows.map((r) => [r.target, r.subjectCode, r.subject, r.evaluator, r.evalType, r.term, r.scorePercent ?? '', r.status, r.submittedAt ?? '']),
  );
  return { columns, rows, csv };
}

export default function ExportReportPage() {
  const [reportType, setReportType] = React.useState<ReportType>('raw');
  const [term, setTerm] = React.useState('all');
  const [subject, setSubject] = React.useState('all');
  const [evalType, setEvalType] = React.useState('all');
  const [status, setStatus] = React.useState('all');

  const entries = React.useMemo(
    () =>
      SCORE_ENTRIES.filter(
        (e) =>
          (term === 'all' || e.term === term) &&
          (subject === 'all' || e.subjectCode === subject) &&
          (evalType === 'all' || e.evalType === evalType) &&
          (status === 'all' || e.status === status),
      ),
    [term, subject, evalType, status],
  );

  const report = React.useMemo(() => buildReport(reportType, entries), [reportType, entries]);

  const summary = React.useMemo(() => {
    const scored = entries.filter((e) => e.scorePercent != null).map((e) => e.scorePercent as number);
    const passed = entries.filter((e) => e.scorePercent != null && (e.scorePercent as number) >= e.passThreshold).length;
    return {
      rows: report.rows.length,
      targets: new Set(entries.map((e) => e.target)).size,
      avg: scored.length ? mean(scored).toFixed(1) : '—',
      passRate: scored.length ? Math.round((passed / scored.length) * 100) : 0,
    };
  }, [entries, report.rows.length]);

  const filtersActive = term !== 'all' || subject !== 'all' || evalType !== 'all' || status !== 'all';
  const resetFilters = () => {
    setTerm('all');
    setSubject('all');
    setEvalType('all');
    setStatus('all');
  };

  const handleExport = () => {
    const name = `report-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(name, report.csv);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="ส่งออกรายงาน"
        description="เลือกรูปแบบรายงานและตัวกรอง ดูตัวอย่างผลลัพธ์ แล้วส่งออกเป็น CSV หรือสั่งพิมพ์"
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="ghost" color={ACCENT.violet} startIcon={PrintIcon} onClick={() => window.print()}>
              พิมพ์
            </Button>
            <Button variant="solid" color={ACCENT.blue} startIcon={FileDownloadIcon} onClick={handleExport}>
              ส่งออก CSV
            </Button>
          </Stack>
        }
      />

      {/* Report type picker */}
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            รูปแบบรายงาน
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {REPORTS.map((r) => (
              <Chip
                key={r.id}
                variant={reportType === r.id ? 'solid' : 'outlined'}
                color={r.color}
                icon={r.icon}
                label={r.label}
                selected={reportType === r.id}
                onClick={() => setReportType(r.id)}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Filters */}
      <FilterBar
        filters={[
          {
            key: 'term',
            label: 'เทอม',
            value: term,
            onChange: setTerm,
            minWidth: 130,
            options: [{ value: 'all', label: 'ทุกเทอม' }, ...SCORE_TERMS.map((t) => ({ value: t, label: t }))],
          },
          {
            key: 'subject',
            label: 'วิชา',
            value: subject,
            onChange: setSubject,
            minWidth: 190,
            options: [
              { value: 'all', label: 'ทุกวิชา' },
              ...SCORE_SUBJECTS.map((s) => ({ value: s.code, label: `${s.code} — ${s.name}` })),
            ],
          },
          {
            key: 'evalType',
            label: 'รูปแบบ',
            value: evalType,
            onChange: setEvalType,
            minWidth: 150,
            options: [
              { value: 'all', label: 'ทุกรูปแบบ' },
              ...EVAL_TYPES.map((t) => ({ value: t, label: EVAL_TYPE_META[t].label })),
            ],
          },
          {
            key: 'status',
            label: 'สถานะ',
            value: status,
            onChange: setStatus,
            minWidth: 140,
            options: [
              { value: 'all', label: 'ทุกสถานะ' },
              { value: 'submitted', label: 'ส่งแล้ว' },
              { value: 'pending', label: 'รอประเมิน' },
            ],
          },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />

      {/* Preview summary */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="จำนวนแถว" value={summary.rows} icon={FactCheckIcon} color={ACCENT.violet} caption="ในรายงานนี้" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ผู้ถูกประเมิน" value={summary.targets} icon={GroupIcon} color={ACCENT.cyan} caption="รายชื่อไม่ซ้ำ" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="คะแนนเฉลี่ย" value={summary.avg} icon={GradeIcon} color={ACCENT.blue} caption="เฉพาะที่ส่งแล้ว" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="อัตราผ่าน" value={`${summary.passRate}%`} icon={TrendingUpIcon} color={ACCENT.green} caption="ตามเกณฑ์รูบริก" />
        </Grid>
      </Grid>

      {/* Preview table */}
      <Card>
        <DataGrid
          rows={report.rows}
          columns={report.columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ border: 0, minHeight: 420 }}
        />
      </Card>
    </Stack>
  );
}

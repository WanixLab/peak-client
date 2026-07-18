'use client';

import * as React from 'react';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
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

/** Download the given rows as a UTF-8 CSV (BOM prefixed so Excel reads Thai). */
function exportCsv(rows: ScoreEntry[]) {
  const headers = ['ผู้ถูกประเมิน', 'ประเภท', 'รหัสวิชา', 'วิชา', 'ผู้ประเมิน', 'รูปแบบ', 'เทอม', 'คะแนน', 'สถานะ', 'วันที่ส่ง'];
  const body = rows.map((r) => [
    r.target,
    r.targetKind === 'group' ? 'กลุ่ม' : 'รายบุคคล',
    r.subjectCode,
    r.subject,
    r.evaluator,
    EVAL_TYPE_META[r.evalType].label,
    r.term,
    r.scorePercent ?? '',
    r.status === 'submitted' ? 'ส่งแล้ว' : 'รอประเมิน',
    r.submittedAt ?? '',
  ]);
  downloadCsv(`scores-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(headers, body));
}

export default function ViewScoresPage() {
  const [search, setSearch] = React.useState('');
  const [term, setTerm] = React.useState('all');
  const [subject, setSubject] = React.useState('all');
  const [evalType, setEvalType] = React.useState('all');
  const [status, setStatus] = React.useState('all');

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return SCORE_ENTRIES.filter(
      (r) =>
        (term === 'all' || r.term === term) &&
        (subject === 'all' || r.subjectCode === subject) &&
        (evalType === 'all' || r.evalType === evalType) &&
        (status === 'all' || r.status === status) &&
        (q === '' ||
          r.target.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q) ||
          r.evaluator.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q)),
    );
  }, [search, term, subject, evalType, status]);

  const summary = React.useMemo(() => {
    const total = rows.length;
    const submitted = rows.filter((r) => r.status === 'submitted');
    const scored = submitted.filter((r) => r.scorePercent != null);
    const avg = scored.length
      ? scored.reduce((s, r) => s + (r.scorePercent ?? 0), 0) / scored.length
      : 0;
    const passed = scored.filter((r) => (r.scorePercent ?? 0) >= r.passThreshold).length;
    return {
      total,
      submitted: submitted.length,
      progress: total ? Math.round((submitted.length / total) * 100) : 0,
      avg: avg.toFixed(1),
      passRate: scored.length ? Math.round((passed / scored.length) * 100) : 0,
      pending: total - submitted.length,
    };
  }, [rows]);

  const columns = React.useMemo<GridColDef<ScoreEntry>[]>(
    () => [
      {
        field: 'target',
        headerName: 'ผู้ถูกประเมิน',
        flex: 1.3,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams<ScoreEntry>) => (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', height: '100%' }}>
            <Chip
              size="sm"
              variant="soft"
              icon={params.row.targetKind === 'group' ? GroupsIcon : PersonIcon}
              color={params.row.targetKind === 'group' ? ACCENT.violet : ACCENT.blue}
              label={params.row.targetKind === 'group' ? 'กลุ่ม' : 'บุคคล'}
            />
            <Typography variant="body2" noWrap>
              {params.row.target}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'subject',
        headerName: 'วิชา',
        flex: 1.3,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams<ScoreEntry>) => (
          <Box sx={{ lineHeight: 1.3, py: 0.5 }}>
            <Typography variant="body2" noWrap>
              {params.row.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.subjectCode}
            </Typography>
          </Box>
        ),
      },
      { field: 'evaluator', headerName: 'ผู้ประเมิน', flex: 1, minWidth: 150 },
      {
        field: 'evalType',
        headerName: 'รูปแบบ',
        width: 130,
        renderCell: (params: GridRenderCellParams<ScoreEntry>) => {
          const meta = EVAL_TYPE_META[params.row.evalType];
          return <Chip size="sm" variant="soft" color={meta.color} label={meta.label} />;
        },
      },
      { field: 'term', headerName: 'เทอม', width: 100, align: 'center', headerAlign: 'center' },
      {
        field: 'scorePercent',
        headerName: 'คะแนน',
        width: 90,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<ScoreEntry>) =>
          params.row.scorePercent == null ? (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: gradeFor(params.row.scorePercent).color, fontVariantNumeric: 'tabular-nums' }}
            >
              {params.row.scorePercent}
            </Typography>
          ),
      },
      {
        field: 'grade',
        headerName: 'เกรด',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params: GridRenderCellParams<ScoreEntry>) => {
          if (params.row.scorePercent == null) return null;
          const g = gradeFor(params.row.scorePercent);
          const passed = params.row.scorePercent >= params.row.passThreshold;
          return <Chip size="sm" variant={passed ? 'soft' : 'outlined'} color={g.color} label={g.grade} />;
        },
      },
      {
        field: 'status',
        headerName: 'สถานะ',
        width: 120,
        renderCell: (params: GridRenderCellParams<ScoreEntry>) =>
          params.row.status === 'submitted' ? (
            <Chip size="sm" variant="solid" color={ACCENT.green} label="ส่งแล้ว" />
          ) : (
            <Chip size="sm" variant="outlined" color={ACCENT.amber} label="รอประเมิน" />
          ),
      },
      {
        field: 'submittedAt',
        headerName: 'วันที่ส่ง',
        width: 120,
        valueFormatter: (value: string | null) => (value ? dateFmt.format(new Date(value)) : '—'),
      },
    ],
    [],
  );

  const filtersActive =
    term !== 'all' || subject !== 'all' || evalType !== 'all' || status !== 'all' || search.trim() !== '';
  const resetFilters = () => {
    setTerm('all');
    setSubject('all');
    setEvalType('all');
    setStatus('all');
    setSearch('');
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="คะแนน"
        description="ผลการประเมินทั้งหมด — หนึ่งแถวคือหนึ่งงานประเมิน (ผู้ประเมิน × ผู้ถูกประเมิน) พร้อมคะแนนและสถานะการส่ง"
        actions={
          <Button variant="soft" color={ACCENT.blue} startIcon={FileDownloadIcon} onClick={() => exportCsv(rows)}>
            ส่งออก CSV
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="ส่งแล้ว"
            value={`${summary.submitted}/${summary.total}`}
            icon={TaskAltIcon}
            color={ACCENT.violet}
            caption={`คืบหน้า ${summary.progress}%`}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="คะแนนเฉลี่ย" value={summary.avg} icon={GradeIcon} color={ACCENT.blue} caption="เฉพาะที่ส่งแล้ว" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="อัตราผ่าน" value={`${summary.passRate}%`} icon={TrendingUpIcon} color={ACCENT.green} caption="ตามเกณฑ์ผ่านของรูบริก" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="รอประเมิน" value={summary.pending} icon={PendingActionsIcon} color={ACCENT.amber} caption="ยังไม่ส่งคะแนน" />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหาผู้ถูกประเมิน วิชา ผู้ประเมิน…' }}
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

      <Card>
        <DataGrid<ScoreEntry>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: 'submittedAt', sort: 'desc' }] },
          }}
          sx={{ border: 0, minHeight: 420 }}
        />
      </Card>
    </Stack>
  );
}

'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import HistoryIcon from '@mui/icons-material/History';
import GradeIcon from '@mui/icons-material/Grade';
import GroupsIcon from '@mui/icons-material/Groups';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import RuleIcon from '@mui/icons-material/Rule';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard } from '@/theme/surfaces';
import {
  ADVISORS,
  ORAL_META,
  ROUND_DUE,
  SCALE_MAX,
  TEAMS,
  TOPICS,
  ratingLevelOf,
  scoreToPercent,
  type Advisor,
  type Round,
  type Team,
} from '@/data/teamOralEvaluation';

const dateFmt = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' });

const topicOf = (id: string) => TOPICS.find((t) => t.id === id)!;

/** สี/ป้ายตามคะแนน 0–5 */
function scoreMeta(score: number | null | undefined): { color: string } {
  if (score == null) return { color: ACCENT.violet };
  if (score < 2) return { color: ACCENT.pink };
  if (score < 3) return { color: ACCENT.amber };
  if (score < 4) return { color: ACCENT.blue };
  return { color: ACCENT.green };
}

// --- โครงข้อมูลบันทึกประวัติ (1 แถว = อาจารย์ 1 ท่าน × 1 ทีม × 1 วงรอบที่ส่งแล้ว) ---

interface HistoryRecord {
  id: string;
  team: Team;
  round: Round;
  advisor: Advisor;
  /** ค่าเฉลี่ยของหัวข้อที่อาจารย์ท่านนี้รับผิดชอบในทีม/รอบนี้ */
  avg: number;
  submittedAt: string;
}

const RECORDS: HistoryRecord[] = TEAMS.flatMap((team) =>
  team.rounds
    .filter((r) => r.status === 'done')
    .flatMap((round) =>
      ADVISORS.map((advisor) => {
        const scores = advisor.topicIds.map((id) => round.results[id]?.score).filter((s): s is number => s != null);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { id: `${team.code}:${round.id}:${advisor.id}`, team, round, advisor, avg, submittedAt: ROUND_DUE[round.id] };
      }),
    ),
);

// --- แถวคะแนนอ่านอย่างเดียว -------------------------------------------------

function ScoreDots({ value }: { value: number }) {
  const rounded = Math.round(value);
  const meta = scoreMeta(value);
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      {Array.from({ length: SCALE_MAX }, (_, i) => i + 1).map((n) => (
        <Box
          key={n}
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: n <= rounded ? meta.color : 'transparent',
            border: '1.5px solid',
            borderColor: n <= rounded ? meta.color : 'divider',
          }}
        />
      ))}
      <Typography variant="caption" sx={{ fontWeight: 700, ml: 0.5, minWidth: 30, color: meta.color }}>
        {value.toFixed(1)}/{SCALE_MAX}
      </Typography>
    </Stack>
  );
}

// --- กล่องรายละเอียด (อ่านอย่างเดียว) --------------------------------------

function DetailDialog({ record, onClose }: { record: HistoryRecord | null; onClose: () => void }) {
  if (!record) return null;
  const { team, round, advisor, avg } = record;
  const passed = avg >= ORAL_META.passScore;
  const meta = scoreMeta(avg);
  const owned = advisor.topicIds.map(topicOf);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(advisor.color, 0.14), color: advisor.color, borderRadius: 2 }}>
            {advisor.name[0]}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {advisor.title} {advisor.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ทีม {team.code} · {team.company} · {round.label} · {round.period}
            </Typography>
          </Box>
          <Stack sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: meta.color, lineHeight: 1 }}>
              {avg.toFixed(2)}<Box component="span" sx={{ fontSize: 14, color: 'text.disabled' }}>/{SCALE_MAX}</Box>
            </Typography>
            <Chip label={passed ? 'ผ่าน' : 'ไม่ผ่าน'} color={passed ? ACCENT.green : ACCENT.pink} variant="soft" size="sm" />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.75 }}>
          <Chip icon={LockIcon} label="ล็อกแล้ว" color={ACCENT.violet} variant="soft" size="sm" />
          <Chip icon={DynamicFormIcon} label={ORAL_META.formName} color={ACCENT.blue} variant="outlined" size="sm" />
          <Chip icon={RuleIcon} label={`ผ่าน ≥ ${ORAL_META.passPercent}%`} color={ACCENT.cyan} variant="outlined" size="sm" />
          <Chip label={`ส่ง ${dateFmt.format(new Date(record.submittedAt))}`} color={ACCENT.violet} variant="outlined" size="sm" />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          หัวข้อที่รับผิดชอบ ({owned.length} จาก {TOPICS.length})
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {owned.map((topic) => {
            const result = round.results[topic.id];
            const level = ratingLevelOf(result?.score);
            return (
              <Box key={topic.id} sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: result?.comment ? 1 : 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, bgcolor: alpha(advisor.color, 0.14), color: advisor.color }}>
                      {topic.no}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{topic.short}</Typography>
                  </Stack>
                  <ScoreDots value={result?.score ?? 0} />
                </Stack>
                {level && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: result?.comment ? 0.5 : 0 }}>
                    ระดับ {level.level} · {level.title}
                  </Typography>
                )}
                {result?.comment && (
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{result.comment}</Typography>
                )}
                {result?.evidence && (
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.75 }}>
                    <LinkIcon sx={{ fontSize: 15, color: ACCENT.blue }} />
                    <Typography variant="caption" sx={{ color: ACCENT.blue, wordBreak: 'break-all' }}>{result.evidence}</Typography>
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="solid" color={ACCENT.violet} onClick={onClose}>ปิด</Button>
      </DialogActions>
    </Dialog>
  );
}

// --- หน้าเพจ -----------------------------------------------------------------

const DONE_ROUNDS = TEAMS[0].rounds.filter((r) => r.status === 'done');
const ROUND_OPTIONS = [
  { value: 'all', label: 'ทุกวงรอบ' },
  ...DONE_ROUNDS.map((r) => ({ value: r.id, label: r.label })),
];
const TEAM_OPTIONS = [
  { value: 'all', label: 'ทุกทีม' },
  ...TEAMS.map((t) => ({ value: t.code, label: `ทีม ${t.code}` })),
];
const ADVISOR_OPTIONS = [
  { value: 'all', label: 'ทุกท่าน' },
  ...ADVISORS.map((a) => ({ value: a.id, label: `${a.title} ${a.name}` })),
];

export default function EvaluationHistoryPage() {
  const [teamFilter, setTeamFilter] = React.useState('all');
  const [roundFilter, setRoundFilter] = React.useState('all');
  const [advisorFilter, setAdvisorFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState<HistoryRecord | null>(null);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return RECORDS.filter(
      (r) =>
        (teamFilter === 'all' || r.team.code === teamFilter) &&
        (roundFilter === 'all' || r.round.id === roundFilter) &&
        (advisorFilter === 'all' || r.advisor.id === advisorFilter) &&
        (q === '' ||
          r.advisor.name.toLowerCase().includes(q) ||
          r.round.label.toLowerCase().includes(q) ||
          r.team.company.toLowerCase().includes(q) ||
          r.team.code.toLowerCase().includes(q)),
    );
  }, [teamFilter, roundFilter, advisorFilter, search]);

  const summary = React.useMemo(() => {
    const count = rows.length;
    const avg = count ? rows.reduce((s, r) => s + r.avg, 0) / count : 0;
    const teams = new Set(rows.map((r) => r.team.code)).size;
    const advisors = new Set(rows.map((r) => r.advisor.id)).size;
    return { count, avg: avg.toFixed(2), teams, advisors };
  }, [rows]);

  const filtersActive = teamFilter !== 'all' || roundFilter !== 'all' || advisorFilter !== 'all' || search.trim() !== '';

  const columns = React.useMemo<GridColDef<HistoryRecord>[]>(
    () => [
      {
        field: 'advisor',
        headerName: 'ผู้ประเมิน',
        flex: 1.3,
        minWidth: 200,
        sortable: false,
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => {
          const a = params.row.advisor;
          return (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', height: '100%' }}>
              <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: alpha(a.color, 0.14), color: a.color }}>{a.name[0]}</Avatar>
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>{a.title} {a.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }} noWrap>{params.row.advisor.topicIds.length} หัวข้อ</Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: 'team',
        headerName: 'ทีม',
        flex: 1,
        minWidth: 160,
        sortable: false,
        valueGetter: (_v, row) => row.team.code,
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => (
          <Stack sx={{ height: '100%', justifyContent: 'center' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Chip label={params.row.team.code} color={ACCENT.violet} variant="soft" size="sm" />
              <Typography variant="body2" noWrap>{params.row.team.company}</Typography>
            </Stack>
          </Stack>
        ),
      },
      { field: 'round', headerName: 'วงรอบ', width: 110, valueGetter: (_v, row) => row.round.label, sortable: false },
      {
        field: 'avg',
        headerName: 'คะแนนเฉลี่ย',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => {
          const meta = scoreMeta(params.row.avg);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, height: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: meta.color }}>{params.row.avg.toFixed(2)}/{SCALE_MAX}</Typography>
              <Typography variant="caption" color="text.secondary">({scoreToPercent(params.row.avg)}%)</Typography>
            </Box>
          );
        },
      },
      {
        field: 'result',
        headerName: 'ผล',
        width: 90,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => {
          const passed = params.row.avg >= ORAL_META.passScore;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Chip label={passed ? 'ผ่าน' : 'ไม่ผ่าน'} color={passed ? ACCENT.green : ACCENT.pink} variant="soft" size="sm" />
            </Box>
          );
        },
      },
      {
        field: 'submittedAt',
        headerName: 'วันที่ส่ง',
        width: 130,
        valueFormatter: (value: string) => dateFmt.format(new Date(value)),
      },
      {
        field: 'actions',
        headerName: '',
        width: 80,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params: GridRenderCellParams<HistoryRecord>) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Button size="sm" variant="ghost" color={ACCENT.violet} startIcon={VisibilityIcon} onClick={() => setActive(params.row)}>ดู</Button>
          </Box>
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="ประวัติการประเมิน"
        description="บันทึกการประเมินที่ส่งแล้ว — แยกตามอาจารย์ ทีม และวงรอบ (อ่านอย่างเดียว)"
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="การประเมินที่ส่งแล้ว" value={summary.count} icon={HistoryIcon} color={ACCENT.violet} caption="ตามที่แสดง" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="คะแนนเฉลี่ยที่ให้" value={`${summary.avg}/${SCALE_MAX}`} icon={GradeIcon} color={ACCENT.green} caption="เฉลี่ยของที่แสดง" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ทีมที่ประเมิน" value={summary.teams} icon={GroupsIcon} color={ACCENT.blue} caption="หัวข้อเดียวกันทุกทีม" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ผู้ประเมิน" value={summary.advisors} icon={SupervisorAccountIcon} color={ACCENT.cyan} caption="แบ่งหัวข้อไม่ทับ" />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหาผู้ประเมิน, ทีม, วงรอบ…' }}
        filters={[
          { key: 'team', label: 'ทีม', value: teamFilter, onChange: setTeamFilter, options: TEAM_OPTIONS },
          { key: 'round', label: 'วงรอบ', value: roundFilter, onChange: setRoundFilter, options: ROUND_OPTIONS },
          { key: 'advisor', label: 'ผู้ประเมิน', value: advisorFilter, onChange: setAdvisorFilter, options: ADVISOR_OPTIONS, minWidth: 200 },
        ]}
        onReset={() => {
          setTeamFilter('all');
          setRoundFilter('all');
          setAdvisorFilter('all');
          setSearch('');
        }}
        active={filtersActive}
      />

      <Card sx={softCard}>
        <DataGrid<HistoryRecord>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          rowHeight={58}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => setActive(params.row)}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: 'submittedAt', sort: 'desc' }] },
          }}
          sx={{ border: 0, minHeight: 420, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      </Card>

      <DetailDialog record={active} onClose={() => setActive(null)} />
    </Stack>
  );
}

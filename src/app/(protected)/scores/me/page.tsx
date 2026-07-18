'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import GradeIcon from '@mui/icons-material/Grade';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Chip from '@/components/common/Chip';
import { useAppSelector } from '@/redux/hooks';
import { ACCENT } from '@/theme/accents';
import {
  EVALUATEES,
  entriesForTarget,
  resolveEvaluatee,
  gradeFor,
  EVAL_TYPE_META,
  type ScoreEntry,
} from '@/data/scores';

const dateFmt = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** One assignment's worth of results aimed at the current evaluatee. */
interface ResultGroup {
  assignmentId: string;
  title: string;
  subject: string;
  subjectCode: string;
  evalType: ScoreEntry['evalType'];
  term: string;
  passThreshold: number;
  entries: ScoreEntry[];
  avg: number | null;
  scoredCount: number;
}

function groupByAssignment(entries: ScoreEntry[]): ResultGroup[] {
  const map = new Map<string, ScoreEntry[]>();
  for (const e of entries) {
    const list = map.get(e.assignmentId) ?? [];
    list.push(e);
    map.set(e.assignmentId, list);
  }
  return Array.from(map.values())
    .map((list) => {
      const head = list[0];
      const scored = list.filter((e) => e.scorePercent != null).map((e) => e.scorePercent as number);
      return {
        assignmentId: head.assignmentId,
        title: head.title,
        subject: head.subject,
        subjectCode: head.subjectCode,
        evalType: head.evalType,
        term: head.term,
        passThreshold: head.passThreshold,
        entries: list,
        avg: scored.length ? Math.round(mean(scored) * 10) / 10 : null,
        scoredCount: scored.length,
      };
    })
    .sort((a, b) => (a.term === b.term ? a.title.localeCompare(b.title, 'th') : b.term.localeCompare(a.term)));
}

/** A single evaluator's line inside a result card. */
function EvaluatorRow({ entry }: { entry: ScoreEntry }) {
  const submitted = entry.status === 'submitted' && entry.scorePercent != null;
  const g = submitted ? gradeFor(entry.scorePercent as number) : null;
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', px: 1, py: 1, borderRadius: 1.5, '&:hover': { bgcolor: 'action.hover' } }}
    >
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {entry.evaluator}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {submitted && entry.submittedAt ? `ส่งเมื่อ ${dateFmt.format(new Date(entry.submittedAt))}` : 'ยังไม่ส่งผล'}
        </Typography>
      </Box>
      {submitted && g ? (
        <>
          <Typography sx={{ fontWeight: 700, color: g.color, fontVariantNumeric: 'tabular-nums' }}>
            {entry.scorePercent}
          </Typography>
          <Chip size="sm" variant="soft" color={g.color} label={g.grade} />
        </>
      ) : (
        <Chip size="sm" variant="outlined" color={ACCENT.amber} icon={HourglassEmptyIcon} label="รอประเมิน" />
      )}
    </Stack>
  );
}

function ResultCard({ group }: { group: ResultGroup }) {
  const meta = EVAL_TYPE_META[group.evalType];
  const graded = group.avg != null;
  const g = graded ? gradeFor(group.avg as number) : null;
  const passed = graded && (group.avg as number) >= group.passThreshold;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {group.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Chip size="sm" variant="soft" color={meta.color} label={meta.label} />
              <Chip size="sm" variant="outlined" color={ACCENT.blue} label={group.subjectCode} />
              <Typography variant="caption" color="text.secondary">
                {group.subject} · เทอม {group.term}
              </Typography>
            </Stack>
          </Box>
          {/* Average score badge */}
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography
              sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: g ? g.color : 'text.disabled', fontVariantNumeric: 'tabular-nums' }}
            >
              {graded ? group.avg : '—'}
            </Typography>
            {graded && g && (
              <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', mt: 0.75 }}>
                <Chip size="sm" variant="soft" color={g.color} label={`เกรด ${g.grade}`} />
                <Chip
                  size="sm"
                  variant={passed ? 'solid' : 'outlined'}
                  color={passed ? ACCENT.green : ACCENT.pink}
                  label={passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                />
              </Stack>
            )}
          </Box>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="overline" color="text.secondary">
          ผู้ประเมิน {group.entries.length} ท่าน · ส่งผลแล้ว {group.scoredCount}
        </Typography>
        <Stack sx={{ mt: 0.5 }}>
          {group.entries.map((e) => (
            <EvaluatorRow key={e.id} entry={e} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MyScoresPage() {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  // Default identity: the logged-in user if they are themselves an evaluatee,
  // otherwise the first available one (demo fallback). The select lets QA/any
  // multi-role user look through another evaluatee's results.
  const defaultName = resolveEvaluatee(user?.name)?.name ?? '';
  const [selected, setSelected] = React.useState(defaultName);
  const identity = React.useMemo(
    () => EVALUATEES.find((e) => e.name === selected) ?? EVALUATEES[0],
    [selected],
  );

  const entries = React.useMemo(() => entriesForTarget(identity?.name ?? ''), [identity]);
  const groups = React.useMemo(() => groupByAssignment(entries), [entries]);

  const summary = React.useMemo(() => {
    const scored = entries.filter((e) => e.scorePercent != null).map((e) => e.scorePercent as number);
    const pending = entries.filter((e) => e.status === 'pending').length;
    const gradedGroups = groups.filter((g) => g.avg != null);
    const passed = gradedGroups.filter((g) => (g.avg as number) >= g.passThreshold).length;
    return {
      avg: scored.length ? mean(scored).toFixed(1) : '—',
      received: scored.length,
      pending,
      passed,
      gradedGroups: gradedGroups.length,
    };
  }, [entries, groups]);

  const IdentityIcon = identity?.kind === 'group' ? GroupsIcon : PersonIcon;
  const identityColor = identity?.kind === 'group' ? ACCENT.violet : ACCENT.blue;

  return (
    <Stack spacing={3}>
      <PageHeader
        title="คะแนนของฉัน"
        description="ผลการประเมินที่คุณได้รับ — รวมทุกงานที่คุณถูกประเมิน แยกตามผู้ประเมินแต่ละท่าน"
      />

      {/* Identity card — who these results belong to, with a "view as" switcher */}
      <Card
        sx={{
          border: 0,
          color: 'common.white',
          background: `linear-gradient(120deg, #5B21B6 0%, ${identityColor} 70%, #7C3AED 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.18)', color: 'common.white' }}>
                <IdentityIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
                  {identity?.name ?? '—'}
                </Typography>
                <Typography sx={{ opacity: 0.9 }}>
                  {identity?.kind === 'group' ? 'ผู้ถูกประเมิน · แบบกลุ่ม/ทีม' : 'ผู้ถูกประเมิน · รายบุคคล'} ·{' '}
                  {identity?.tasks ?? 0} งานประเมิน
                </Typography>
              </Box>
            </Stack>
            <TextField
              select
              size="small"
              label="ดูในฐานะ"
              value={identity?.name ?? ''}
              onChange={(e) => setSelected(e.target.value)}
              sx={{
                minWidth: 240,
                bgcolor: 'rgba(255,255,255,0.16)',
                borderRadius: 1,
                '& .MuiInputLabel-root, & .MuiInputBase-input, & .MuiSvgIcon-root': { color: 'common.white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
              }}
            >
              {EVALUATEES.map((e) => (
                <MenuItem key={e.name} value={e.name}>
                  {e.kind === 'group' ? '👥 ' : '👤 '}
                  {e.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Personal KPI row */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="คะแนนเฉลี่ยของฉัน" value={summary.avg} icon={GradeIcon} color={ACCENT.violet} caption="เฉลี่ยจากผลที่ได้รับ" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ผลที่ได้รับแล้ว" value={summary.received} icon={RateReviewIcon} color={ACCENT.blue} caption="จำนวนการประเมิน" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="รอผลประเมิน" value={summary.pending} icon={PendingActionsIcon} color={ACCENT.amber} caption="ยังไม่ส่งคะแนน" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ผ่านเกณฑ์" value={`${summary.passed}/${summary.gradedGroups}`} icon={EmojiEventsIcon} color={ACCENT.green} caption="ตามเกณฑ์รูบริก" />
        </Grid>
      </Grid>

      {/* Result cards, one per evaluation */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          ผลการประเมินรายงาน ({groups.length})
        </Typography>
        {groups.length === 0 ? (
          <Card
            sx={{
              p: 5,
              textAlign: 'center',
              border: 'none',
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.text.primary, 0.03),
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              ยังไม่มีการประเมินสำหรับผู้ใช้นี้
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {groups.map((g) => (
              <Grid key={g.assignmentId} size={{ xs: 12, md: 6 }}>
                <ResultCard group={g} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Stack>
  );
}

'use client';

import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupsIcon from '@mui/icons-material/Groups';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import RuleIcon from '@mui/icons-material/Rule';
import LinkIcon from '@mui/icons-material/Link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard, softCardHover } from '@/theme/surfaces';
import {
  ADVISORS,
  ORAL_META,
  RATING_LEVELS,
  ROUND_DUE,
  TEAMS,
  TOPICS,
  ratingLevelOf,
  type Advisor,
  type Round,
  type Team,
} from '@/data/teamOralEvaluation';

const dateFmt = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' });
// "วันนี้" ของสถานการณ์จำลอง — อยู่ในช่วงวงรอบที่ 4 ที่กำลังประเมิน
const TODAY = new Date('2027-02-18');

const topicOf = (id: string) => TOPICS.find((t) => t.id === id)!;

/** สี/ป้ายตามคะแนน 0–5 */
function scoreMeta(score: number | null | undefined): { color: string } {
  if (score == null) return { color: ACCENT.violet };
  if (score < 2) return { color: ACCENT.pink };
  if (score < 3) return { color: ACCENT.amber };
  if (score < 4) return { color: ACCENT.blue };
  return { color: ACCENT.green };
}

type TaskStatus = 'not_started' | 'in_progress' | 'submitted';

const STATUS_META: Record<TaskStatus, { label: string; color: string; icon: typeof EditNoteIcon }> = {
  not_started: { label: 'ยังไม่เริ่ม', color: ACCENT.amber, icon: PendingActionsIcon },
  in_progress: { label: 'กำลังทำ', color: ACCENT.blue, icon: EditNoteIcon },
  submitted: { label: 'ส่งแล้ว', color: ACCENT.green, icon: CheckCircleIcon },
};

/** จำนวนวันถึงกำหนด (ติดลบ = เกิน) พร้อมป้าย/สี */
function dueInfo(dueDate: string) {
  const days = Math.ceil((new Date(dueDate).getTime() - TODAY.getTime()) / 86_400_000);
  if (days < 0) return { days, label: `เกินกำหนด ${-days} วัน`, color: 'error.main' as const };
  if (days === 0) return { days, label: 'ครบกำหนดวันนี้', color: 'error.main' as const };
  if (days <= 7) return { days, label: `อีก ${days} วัน`, color: 'warning.main' as const };
  return { days, label: `ครบกำหนด ${dateFmt.format(new Date(dueDate))}`, color: 'text.secondary' as const };
}

// --- สเกลให้คะแนน 5 ระดับ (สิ่งที่ผู้ประเมินคลิก) ---------------------------

function RatingScale({
  value,
  onChange,
  readOnly,
}: {
  value?: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  // แสดงระดับเต็ม 1–5; ข้อมูลย้อนหลังที่เป็นครึ่งคะแนนจะไฮไลต์ระดับที่ใกล้ที่สุด
  const active = value != null ? Math.round(value) : undefined;
  return (
    <Stack direction="row" spacing={0.75}>
      {RATING_LEVELS.map((lv) => {
        const on = active === lv.level;
        const meta = scoreMeta(lv.level);
        return (
          <Tooltip key={lv.level} title={`${lv.level} — ${lv.title}`} arrow disableInteractive>
            <Box
              component={readOnly ? 'div' : 'button'}
              type={readOnly ? undefined : 'button'}
              onClick={readOnly ? undefined : () => onChange?.(lv.level)}
              aria-label={`${lv.level} — ${lv.title}`}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 15,
                cursor: readOnly ? 'default' : 'pointer',
                border: '1px solid',
                borderColor: on ? meta.color : 'divider',
                bgcolor: on ? alpha(meta.color, 0.14) : 'transparent',
                color: on ? meta.color : 'text.secondary',
                transition: 'all .15s',
                '&:hover': readOnly ? undefined : { borderColor: meta.color, bgcolor: alpha(meta.color, 0.08) },
              }}
            >
              {lv.level}
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

// --- ฟอร์มที่ผู้ประเมินเห็น (เฉพาะหัวข้อที่ตัวเองรับผิดชอบ) -----------------

interface Draft {
  scores: Record<string, number | undefined>;
  comments: Record<string, string>;
}

function EvaluationForm({
  advisor,
  team,
  round,
  readOnly,
  onClose,
  onSaveDraft,
  onSubmit,
}: {
  advisor: Advisor;
  team: Team;
  round: Round;
  readOnly: boolean;
  onClose: () => void;
  onSaveDraft: (draft: Draft) => void;
  onSubmit: (draft: Draft) => void;
}) {
  const owned = advisor.topicIds.map(topicOf);
  const [draft, setDraft] = React.useState<Draft>(() => ({
    scores: Object.fromEntries(advisor.topicIds.map((id) => [id, round.results[id]?.score ?? undefined])),
    comments: Object.fromEntries(advisor.topicIds.map((id) => [id, round.results[id]?.comment ?? ''])),
  }));
  const [showLegend, setShowLegend] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);

  const rated = owned.filter((t) => draft.scores[t.id] != null).length;
  const progress = Math.round((rated / owned.length) * 100);
  const missing = owned.filter((t) => draft.scores[t.id] == null);

  const setScore = (id: string, v: number) => setDraft((d) => ({ ...d, scores: { ...d.scores, [id]: v } }));
  const setComment = (id: string, v: string) => setDraft((d) => ({ ...d, comments: { ...d.comments, [id]: v } }));

  const handleSubmit = () => {
    if (missing.length > 0) {
      setShowErrors(true);
      return;
    }
    onSubmit(draft);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet, borderRadius: 2 }}>
            <DynamicFormIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {ORAL_META.formName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ทีม {team.code} · {team.company} · {round.label}
            </Typography>
          </Box>
        </Stack>

        {/* ลำดับ ฟอร์ม → เกณฑ์ → คะแนน */}
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1.5, alignItems: 'center' }}>
          <Chip icon={RuleIcon} label={`${ORAL_META.rubricName} · ผ่าน ≥ ${ORAL_META.passPercent}%`} color={ACCENT.cyan} variant="outlined" size="sm" />
          <Chip icon={AssignmentIndIcon} label={`คุณรับผิดชอบ ${owned.length} จาก ${TOPICS.length} หัวข้อ`} color={ACCENT.violet} variant="soft" size="sm" />
        </Stack>

        <Box sx={{ mt: 1.5 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {readOnly ? 'ส่งแล้ว' : `ให้คะแนนแล้ว ${rated}/${owned.length} หัวข้อ`}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{readOnly ? '100%' : `${progress}%`}</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={readOnly ? 100 : progress} color={readOnly ? 'success' : 'primary'} sx={{ height: 8, borderRadius: 5 }} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {readOnly && (
          <Alert severity="success" icon={<LockIcon fontSize="inherit" />} sx={{ mb: 2 }}>
            ส่งการประเมินนี้แล้ว — ดูได้อย่างเดียว
          </Alert>
        )}
        {!readOnly && (
          <Alert severity="info" sx={{ mb: 2 }}>
            คุณได้รับมอบหมายให้ประเมิน <strong>{owned.length}</strong> หัวข้อด้านล่าง อีก {TOPICS.length - owned.length} หัวข้อที่เหลือ
            อาจารย์ท่านอื่นเป็นผู้ประเมิน (แบ่งกันไม่ทับ)
          </Alert>
        )}
        {showErrors && missing.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            กรุณาให้คะแนนให้ครบทุกหัวข้อก่อนส่ง — เหลืออีก {missing.length} หัวข้อ
          </Alert>
        )}

        {/* อ้างอิงเกณฑ์ 5 ระดับ */}
        <Box sx={{ mb: 2 }}>
          <Button variant="ghost" color={ACCENT.violet} size="sm" endIcon={ExpandMoreIcon} onClick={() => setShowLegend((s) => !s)}>
            เกณฑ์การให้คะแนน 5 ระดับ
          </Button>
          <Collapse in={showLegend}>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {RATING_LEVELS.map((lv) => (
                <Stack key={lv.level} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip label={String(lv.level)} color={scoreMeta(lv.level).color} variant="soft" size="sm" />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{lv.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>— {lv.description}</Typography>
                </Stack>
              ))}
            </Stack>
          </Collapse>
        </Box>

        <Stack spacing={1.5}>
          {owned.map((topic) => {
            const value = draft.scores[topic.id];
            const level = ratingLevelOf(value);
            const meta = scoreMeta(value);
            const isMissing = showErrors && value == null;
            return (
              <Box
                key={topic.id}
                sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: isMissing ? 'error.main' : 'divider' }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet }}>
                      {topic.no}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{topic.name}</Typography>
                  </Stack>
                  <RatingScale value={value} onChange={(v) => setScore(topic.id, v)} readOnly={readOnly} />
                </Stack>

                {level && (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: meta.color }}>
                      ระดับ {value} · {level.title}
                    </Typography>
                  </Stack>
                )}

                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  label="ข้อคิดเห็น / สิ่งที่ปรับปรุงได้"
                  placeholder="ระบุจุดเด่น จุดที่ควรปรับปรุง หรือแนบลิงก์หลักฐาน…"
                  value={draft.comments[topic.id]}
                  onChange={(e) => setComment(topic.id, e.target.value)}
                  disabled={readOnly}
                />
                {readOnly && round.results[topic.id]?.evidence && (
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 1 }}>
                    <LinkIcon sx={{ fontSize: 16, color: ACCENT.blue }} />
                    <Typography variant="caption" sx={{ color: ACCENT.blue, wordBreak: 'break-all' }}>
                      {round.results[topic.id]?.evidence}
                    </Typography>
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>{readOnly ? 'ปิด' : 'ยกเลิก'}</Button>
        {!readOnly && (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" color={ACCENT.violet} onClick={() => onSaveDraft(draft)}>บันทึกร่าง</Button>
            <Button variant="solid" color={ACCENT.violet} onClick={handleSubmit}>ส่งการประเมิน</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// --- การ์ดงานประเมิน --------------------------------------------------------

interface Task {
  team: Team;
  round: Round;
  status: TaskStatus;
  rated: number;
  owned: number;
}

function TaskCard({ advisor, task, onOpen }: { advisor: Advisor; task: Task; onOpen: () => void }) {
  const { team, round, status } = task;
  const statusMeta = STATUS_META[status];
  const submitted = status === 'submitted';
  const due = dueInfo(ROUND_DUE[round.id]);
  const progress = Math.round((task.rated / task.owned) * 100);
  const ownedTopics = advisor.topicIds.map(topicOf);

  return (
    <Card sx={softCardHover}>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet, width: 48, height: 48, borderRadius: 2 }}>
            <GroupsIcon />
          </Avatar>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
              <Chip label={`ทีม ${team.code}`} color={ACCENT.violet} variant="solid" size="sm" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {team.company} — {round.label}
              </Typography>
              <Chip label={statusMeta.label} color={statusMeta.color} variant={submitted ? 'soft' : 'solid'} size="sm" icon={statusMeta.icon} />
            </Stack>
            <Typography variant="body2" color="text.secondary" noWrap>
              {ORAL_META.subjectCode} · {team.system}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {ownedTopics.map((t) => (
                <Chip key={t.id} label={`${t.no}. ${t.short}`} color={ACCENT.cyan} variant="outlined" size="sm" />
              ))}
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1 }}>
              <EventIcon sx={{ fontSize: 15, color: submitted ? 'text.secondary' : due.color }} />
              <Typography variant="caption" sx={{ color: submitted ? 'text.secondary' : due.color, fontWeight: 600 }}>
                {submitted ? `ส่งเมื่อ ${dateFmt.format(new Date(ROUND_DUE[round.id]))}` : due.label}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 180 }, flexShrink: 0 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">รับผิดชอบ {task.owned} หัวข้อ</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{progress}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={submitted ? 100 : progress} color={submitted ? 'success' : 'primary'} sx={{ height: 6, borderRadius: 5 }} />
          </Box>

          <Button
            variant={submitted ? 'outlined' : 'solid'}
            color={ACCENT.violet}
            startIcon={submitted ? VisibilityIcon : status === 'in_progress' ? EditNoteIcon : PlayArrowIcon}
            onClick={onOpen}
            style={{ flexShrink: 0, minWidth: 120 }}
          >
            {submitted ? 'ดู' : status === 'in_progress' ? 'ทำต่อ' : 'เริ่มประเมิน'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- หน้าเพจ -----------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'not_started', label: 'ยังไม่เริ่ม' },
  { value: 'in_progress', label: 'กำลังทำ' },
  { value: 'submitted', label: 'ส่งแล้ว' },
];
const TEAM_OPTIONS = [
  { value: 'all', label: 'ทุกทีม' },
  ...TEAMS.map((t) => ({ value: t.code, label: `ทีม ${t.code} — ${t.company}` })),
];

const subKey = (teamCode: string, roundId: string, advisorId: string) => `${teamCode}:${roundId}:${advisorId}`;

export default function MyEvaluationsPage() {
  // มุมมองผู้ประเมิน: เลือกว่ากำลังใช้งานในนามของอาจารย์ท่านใด (กำหนดหัวข้อที่เห็น)
  const [advisorId, setAdvisorId] = React.useState(ADVISORS[0].id);
  const advisor = ADVISORS.find((a) => a.id === advisorId)!;

  const [teams, setTeams] = React.useState<Team[]>(TEAMS);
  // ส่งแล้วหรือยัง คีย์ `${teamCode}:${roundId}:${advisorId}` — วงรอบที่เสร็จถือว่าทุกคนส่งแล้ว
  const [submitted, setSubmitted] = React.useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    TEAMS.forEach((team) =>
      team.rounds.forEach((r) => {
        if (r.status === 'done') ADVISORS.forEach((a) => (seed[subKey(team.code, r.id, a.id)] = true));
      }),
    );
    return seed;
  });

  const [statusFilter, setStatusFilter] = React.useState('all');
  const [teamFilter, setTeamFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState<{ team: Team; round: Round } | null>(null);
  const [dialogKey, setDialogKey] = React.useState(0);

  const statusOf = React.useCallback(
    (team: Team, round: Round): TaskStatus => {
      if (submitted[subKey(team.code, round.id, advisorId)]) return 'submitted';
      const anyRated = advisor.topicIds.some((id) => round.results[id]?.score != null);
      return anyRated ? 'in_progress' : 'not_started';
    },
    [submitted, advisorId, advisor],
  );

  const tasks: Task[] = React.useMemo(
    () =>
      teams.flatMap((team) =>
        team.rounds.map((round) => ({
          team,
          round,
          status: statusOf(team, round),
          rated: advisor.topicIds.filter((id) => round.results[id]?.score != null).length,
          owned: advisor.topicIds.length,
        })),
      ),
    [teams, statusOf, advisor],
  );

  const summary = React.useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === 'not_started').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      submitted: tasks.filter((t) => t.status === 'submitted').length,
      teams: new Set(tasks.filter((t) => t.status !== 'submitted').map((t) => t.team.code)).size,
    }),
    [tasks],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (statusFilter === 'all' || t.status === statusFilter) &&
        (teamFilter === 'all' || t.team.code === teamFilter) &&
        (q === '' ||
          t.round.label.toLowerCase().includes(q) ||
          t.team.company.toLowerCase().includes(q) ||
          t.team.code.toLowerCase().includes(q)),
    );
  }, [tasks, statusFilter, teamFilter, search]);

  const openTask = (team: Team, round: Round) => {
    setOpen({ team, round });
    setDialogKey((k) => k + 1);
  };

  const applyDraft = (teamCode: string, roundId: string, draft: Draft) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.code !== teamCode
          ? team
          : {
              ...team,
              rounds: team.rounds.map((r) => {
                if (r.id !== roundId) return r;
                const results = { ...r.results };
                advisor.topicIds.forEach((id) => {
                  results[id] = { score: draft.scores[id] ?? null, comment: draft.comments[id] || undefined, evidence: r.results[id]?.evidence };
                });
                return { ...r, results };
              }),
            },
      ),
    );
  };

  const saveDraft = (draft: Draft) => {
    if (!open) return;
    applyDraft(open.team.code, open.round.id, draft);
    setOpen(null);
  };

  const submit = (draft: Draft) => {
    if (!open) return;
    applyDraft(open.team.code, open.round.id, draft);
    setSubmitted((prev) => ({ ...prev, [subKey(open.team.code, open.round.id, advisorId)]: true }));
    setOpen(null);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="งานประเมินของฉัน"
        description="งานประเมินที่ได้รับมอบหมายให้คุณ — ประเมินหัวข้อที่รับผิดชอบ (หัวข้อเดียวกัน) ให้กับทุกทีมที่ดูแล"
        actions={
          <TextField
            select
            size="small"
            label="ประเมินในนามของ"
            value={advisorId}
            onChange={(e) => setAdvisorId(e.target.value)}
            sx={{ minWidth: 230 }}
          >
            {ADVISORS.map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.title} {a.name}</MenuItem>
            ))}
          </TextField>
        }
      />

      {/* อธิบายการเชื่อมโยง: การมอบหมาย → หัวข้อของคุณ × หลายทีม */}
      <Card sx={[softCard, { bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }]}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
            <Chip icon={DynamicFormIcon} label={ORAL_META.formName} color={ACCENT.blue} variant="outlined" size="sm" />
            <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Chip icon={RuleIcon} label="เกณฑ์ 8 หัวข้อ" color={ACCENT.cyan} variant="outlined" size="sm" />
            <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Chip icon={AssignmentIndIcon} label="มอบหมายผู้ประเมิน" color={ACCENT.violet} variant="outlined" size="sm" />
            <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Chip icon={GroupsIcon} label={`หัวข้อของ ${advisor.name} (${advisor.topicIds.length}) × ${TEAMS.length} ทีม`} color={ACCENT.green} variant="soft" size="sm" />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            อาจารย์แต่ละท่านรับผิดชอบหัวข้อเดิมของตัวเอง แล้วประเมินให้กับ <strong>ทุกทีม</strong> ที่ได้รับมอบหมาย
            (ระบบสร้างงาน 1 งานต่อ 1 ทีม 1 วงรอบ โดยฟอร์มมีเฉพาะหัวข้อที่คุณรับผิดชอบ)
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ยังไม่เริ่ม" value={summary.todo} icon={PendingActionsIcon} color={ACCENT.amber} caption={`ค้างอยู่ ${summary.teams} ทีม`} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="กำลังทำ" value={summary.inProgress} icon={EditNoteIcon} color={ACCENT.blue} caption="บันทึกร่างไว้" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ส่งแล้ว" value={summary.submitted} icon={CheckCircleIcon} color={ACCENT.green} caption="เสร็จสมบูรณ์" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="ทีมที่ดูแล" value={TEAMS.length} icon={GroupsIcon} color={ACCENT.violet} caption="หัวข้อเดียวกันทุกทีม" />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหาทีม, วงรอบ…' }}
        filters={[
          { key: 'team', label: 'ทีม', value: teamFilter, onChange: setTeamFilter, options: TEAM_OPTIONS, minWidth: 210 },
          { key: 'status', label: 'สถานะ', value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
        ]}
        onReset={() => {
          setStatusFilter('all');
          setTeamFilter('all');
          setSearch('');
        }}
        active={statusFilter !== 'all' || teamFilter !== 'all' || search.trim() !== ''}
      />

      {filtered.length === 0 ? (
        <Card sx={softCard}>
          <CardContent>
            <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6">ไม่มีงานประเมินที่ตรงกับตัวกรอง</Typography>
              <Typography variant="body2" color="text.secondary">ลองล้างตัวกรองหรือคำค้นหา</Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filtered.map((task) => (
            <TaskCard key={`${task.team.code}:${task.round.id}`} advisor={advisor} task={task} onOpen={() => openTask(task.team, task.round)} />
          ))}
        </Stack>
      )}

      {open && (
        <EvaluationForm
          key={dialogKey}
          advisor={advisor}
          team={open.team}
          round={open.round}
          readOnly={statusOf(open.team, open.round) === 'submitted'}
          onClose={() => setOpen(null)}
          onSaveDraft={saveDraft}
          onSubmit={submit}
        />
      )}
    </Stack>
  );
}

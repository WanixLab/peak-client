'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import GroupsIcon from '@mui/icons-material/Groups';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import ChecklistIcon from '@mui/icons-material/Checklist';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import GradeIcon from '@mui/icons-material/Grade';
import RuleIcon from '@mui/icons-material/Rule';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LinkIcon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard } from '@/theme/surfaces';
import {
  ADVISORS,
  RATING_LEVELS,
  ROLE_LABEL,
  SCALE_MAX,
  TEAMS,
  TOPICS,
  advisorOfTopic,
  advisorRoundAverage,
  roundAverage,
  type Advisor,
  type Round,
  type Team,
  type Topic,
} from '@/data/teamOralEvaluation';

// --- สีตามคะแนน (0–5) -------------------------------------------------------

/** จับคู่คะแนน 0–5 กับสี/ป้าย เพื่อใช้ทั่วหน้า */
function scoreMeta(score: number | null | undefined): { color: string; label: string } {
  if (score == null) return { color: ACCENT.violet, label: '—' };
  if (score < 2) return { color: ACCENT.pink, label: score.toFixed(1) };
  if (score < 3) return { color: ACCENT.amber, label: score.toFixed(1) };
  if (score < 4) return { color: ACCENT.blue, label: score.toFixed(1) };
  return { color: ACCENT.green, label: score.toFixed(1) };
}

// --- เม็ดคะแนนในตาราง -------------------------------------------------------

function ScoreCell({
  score,
  onClick,
  dim,
}: {
  score: number | null | undefined;
  onClick?: () => void;
  dim?: boolean;
}) {
  const meta = scoreMeta(score);
  const filled = score != null;
  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        minWidth: 52,
        height: 40,
        borderRadius: 1.5,
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: 15,
        fontVariantNumeric: 'tabular-nums',
        border: '1px solid',
        borderColor: filled ? alpha(meta.color, 0.35) : 'divider',
        bgcolor: filled ? alpha(meta.color, dim ? 0.06 : 0.14) : 'transparent',
        color: filled ? meta.color : 'text.disabled',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all .15s',
        '&:hover': onClick ? { borderColor: meta.color, transform: 'translateY(-1px)' } : undefined,
      }}
    >
      {meta.label}
    </Box>
  );
}

// --- ตัวชี้แนวโน้ม (เทียบสองรอบล่าสุดที่ให้คะแนนแล้ว) ------------------------

function TrendChip({ topicId, rounds }: { topicId: string; rounds: Round[] }) {
  const scored = rounds
    .map((r) => r.results[topicId]?.score)
    .filter((s): s is number => s != null);
  if (scored.length < 2) return null;
  const delta = scored[scored.length - 1] - scored[scored.length - 2];
  const Icon = delta > 0 ? TrendingUpIcon : delta < 0 ? TrendingDownIcon : TrendingFlatIcon;
  const color = delta > 0 ? ACCENT.green : delta < 0 ? ACCENT.pink : 'text.disabled';
  return (
    <Tooltip title={`เทียบรอบก่อนหน้า ${delta > 0 ? '+' : ''}${delta.toFixed(1)}`}>
      <Icon sx={{ fontSize: 16, color }} />
    </Tooltip>
  );
}

// --- กล่องดูรายละเอียดช่อง (คะแนน + คอมเมนต์ + หลักฐาน) ---------------------

function CellDetailDialog({
  team,
  round,
  topic,
  onClose,
}: {
  team: Team;
  round: Round | null;
  topic: Topic | null;
  onClose: () => void;
}) {
  if (!round || !topic) return null;
  const result = round.results[topic.id];
  const advisor = advisorOfTopic(topic.id);
  const meta = scoreMeta(result?.score);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(meta.color, 0.14), color: meta.color, borderRadius: 2 }}>
            {topic.no}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{topic.short}</Typography>
            <Typography variant="caption" color="text.secondary">
              ทีม {team.code} · {round.label} · {round.period}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">{topic.name}</Typography>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: alpha(meta.color, 0.1),
                border: '1px solid',
                borderColor: alpha(meta.color, 0.35),
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1, color: meta.color }}>
                {result?.score != null ? result.score.toFixed(1) : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">จาก {SCALE_MAX}</Typography>
            </Box>
            {advisor && (
              <Box>
                <Typography variant="caption" color="text.secondary">ผู้ประเมิน</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.25 }}>
                  <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: alpha(advisor.color, 0.16), color: advisor.color }}>
                    {advisor.name[0]}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{advisor.title} {advisor.name}</Typography>
                </Stack>
              </Box>
            )}
          </Stack>

          {result?.comment ? (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ข้อคิดเห็น / สิ่งที่ปรับปรุงได้</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>{result.comment}</Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">ยังไม่มีข้อคิดเห็นสำหรับรอบนี้</Typography>
          )}

          {result?.evidence && (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <LinkIcon sx={{ fontSize: 16, color: ACCENT.blue }} />
              <Typography variant="body2" sx={{ color: ACCENT.blue, wordBreak: 'break-all' }}>{result.evidence}</Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>ปิด</Button>
      </DialogActions>
    </Dialog>
  );
}

// --- กล่องให้คะแนนรอบที่กำลังดำเนินการ (แบ่งตามอาจารย์) ---------------------

interface Draft {
  scores: Record<string, number | null>;
  comments: Record<string, string>;
}

function ScoreRoundDialog({
  team,
  round,
  onClose,
  onSave,
}: {
  team: Team;
  round: Round | null;
  onClose: () => void;
  onSave: (roundId: string, draft: Draft) => void;
}) {
  const [draft, setDraft] = React.useState<Draft>(() => ({
    scores: Object.fromEntries(TOPICS.map((t) => [t.id, round?.results[t.id]?.score ?? null])),
    comments: Object.fromEntries(TOPICS.map((t) => [t.id, round?.results[t.id]?.comment ?? ''])),
  }));

  if (!round) return null;

  const scored = TOPICS.filter((t) => draft.scores[t.id] != null).length;
  const progress = Math.round((scored / TOPICS.length) * 100);

  const setScore = (id: string, v: number) => setDraft((d) => ({ ...d, scores: { ...d.scores, [id]: v } }));
  const setComment = (id: string, v: string) => setDraft((d) => ({ ...d, comments: { ...d.comments, [id]: v } }));

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet, borderRadius: 2 }}>
            <EditNoteIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>ให้คะแนน {round.label} · ทีม {team.code}</Typography>
            <Typography variant="caption" color="text.secondary">
              {round.period} · อาจารย์แต่ละท่านให้คะแนนเฉพาะหัวข้อที่รับผิดชอบ
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">ให้คะแนนแล้ว {scored}/{TOPICS.length} หัวข้อ</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{progress}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5 }} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {ADVISORS.map((advisor) => (
            <Box key={advisor.id}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: alpha(advisor.color, 0.16), color: advisor.color }}>
                  {advisor.name[0]}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{advisor.title} {advisor.name}</Typography>
                <Chip label={`${advisor.topicIds.length} หัวข้อ`} color={advisor.color} variant="soft" size="sm" />
              </Stack>
              <Stack spacing={2}>
                {advisor.topicIds.map((tid) => {
                  const topic = TOPICS.find((t) => t.id === tid)!;
                  const value = draft.scores[tid];
                  const meta = scoreMeta(value);
                  return (
                    <Box key={tid} sx={{ p: 1.75, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, pr: 1 }}>{topic.no}. {topic.short}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: meta.color, flexShrink: 0 }}>
                          {value != null ? value.toFixed(1) : '—'}<Box component="span" sx={{ color: 'text.disabled', fontWeight: 500 }}> / {SCALE_MAX}</Box>
                        </Typography>
                      </Stack>
                      <Slider
                        size="small"
                        min={0}
                        max={SCALE_MAX}
                        step={0.5}
                        marks
                        value={value ?? 0}
                        onChange={(_, v) => setScore(tid, v as number)}
                        valueLabelDisplay="auto"
                        sx={{ color: meta.color }}
                      />
                      <TextField
                        size="small"
                        fullWidth
                        multiline
                        minRows={1}
                        placeholder="ข้อคิดเห็น / สิ่งที่ปรับปรุงได้ (ไม่บังคับ)"
                        value={draft.comments[tid]}
                        onChange={(e) => setComment(tid, e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>ยกเลิก</Button>
        <Button variant="solid" color={ACCENT.violet} onClick={() => onSave(round.id, draft)}>บันทึกคะแนน</Button>
      </DialogActions>
    </Dialog>
  );
}

// --- การ์ดอาจารย์ + หัวข้อที่รับผิดชอบ --------------------------------------

function AdvisorSplitCard({ advisor, rounds }: { advisor: Advisor; rounds: Round[] }) {
  return (
    <Card sx={[softCard, { height: '100%' }]}>
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(advisor.color, 0.16), color: advisor.color, fontWeight: 700 }}>
            {advisor.name[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {advisor.title} {advisor.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">รับผิดชอบ {advisor.topicIds.length} หัวข้อ</Typography>
          </Box>
        </Stack>

        <Stack spacing={0.75} sx={{ mb: 1.5 }}>
          {advisor.topicIds.map((tid) => {
            const topic = TOPICS.find((t) => t.id === tid)!;
            return (
              <Chip key={tid} label={`${topic.no}. ${topic.short}`} color={advisor.color} variant="outlined" size="sm" />
            );
          })}
        </Stack>

        <Divider sx={{ mb: 1.25 }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ค่าเฉลี่ยที่ให้แต่ละวงรอบ</Typography>
        <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
          {rounds.map((r) => {
            const avg = advisorRoundAverage(r, advisor);
            const meta = scoreMeta(avg);
            return (
              <Tooltip key={r.id} title={r.label}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Box
                    sx={{
                      height: 34,
                      borderRadius: 1.25,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      color: avg != null ? meta.color : 'text.disabled',
                      bgcolor: avg != null ? alpha(meta.color, 0.12) : 'transparent',
                      border: '1px solid',
                      borderColor: avg != null ? alpha(meta.color, 0.3) : 'divider',
                    }}
                  >
                    {avg != null ? avg.toFixed(1) : '—'}
                  </Box>
                  <Typography variant="caption" color="text.secondary">R{r.no}</Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- หน้าเพจ -----------------------------------------------------------------

export default function TeamOralEvaluationPage() {
  const [teams, setTeams] = React.useState<Team[]>(TEAMS);
  const [teamCode, setTeamCode] = React.useState(TEAMS[0].code);
  const team = teams.find((t) => t.code === teamCode)!;
  const rounds = team.rounds;

  const [cell, setCell] = React.useState<{ round: Round; topic: Topic } | null>(null);
  const [scoringRound, setScoringRound] = React.useState<Round | null>(null);

  const doneRounds = rounds.filter((r) => r.status === 'done');
  const latestDone = doneRounds[doneRounds.length - 1];
  const latestAvg = latestDone ? roundAverage(latestDone) : null;
  const prevDone = doneRounds[doneRounds.length - 2];
  const prevAvg = prevDone ? roundAverage(prevDone) : null;
  const activeRound = rounds.find((r) => r.status === 'in_progress') ?? null;

  const saveRound = (roundId: string, draft: Draft) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.code !== teamCode) return t;
        return {
          ...t,
          rounds: t.rounds.map((r) => {
            if (r.id !== roundId) return r;
            const results = { ...r.results };
            TOPICS.forEach((tp) => {
              results[tp.id] = {
                score: draft.scores[tp.id],
                comment: draft.comments[tp.id] || undefined,
                evidence: r.results[tp.id]?.evidence,
              };
            });
            const allScored = TOPICS.every((tp) => draft.scores[tp.id] != null);
            return { ...r, results, status: allScored ? 'done' : r.status };
          }),
        };
      }),
    );
    setScoringRound(null);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="การประเมินทีม (Oral)"
        description="ประเมินความก้าวหน้าโครงงานเป็น 4 วงรอบ รอบละ 2 เดือน — อาจารย์ 3 ท่านแบ่งกันประเมิน 8 หัวข้อ (ไม่ทับกัน) ในทุกทีม"
        actions={
          <Stack direction="row" spacing={1}>
            <TextField
              select
              size="small"
              label="ทีม"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {teams.map((t) => (
                <MenuItem key={t.code} value={t.code}>ทีม {t.code} — {t.company}</MenuItem>
              ))}
            </TextField>
            {activeRound && (
              <Button variant="solid" color={ACCENT.violet} startIcon={EditNoteIcon} onClick={() => setScoringRound(activeRound)}>
                ให้คะแนน {activeRound.label}
              </Button>
            )}
          </Stack>
        }
      />

      {/* แบนเนอร์ทีม */}
      <Card sx={softCard}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <Avatar variant="rounded" sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: alpha(ACCENT.violet, 0.14), color: ACCENT.violet }}>
              <GroupsIcon />
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{team.company}</Typography>
                <Chip label={`ทีม ${team.code}`} color={ACCENT.violet} variant="solid" size="sm" />
              </Stack>
              <Typography variant="body2" color="text.secondary">ระบบ: {team.system}</Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>สมาชิก {team.members.length} คน</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5, maxWidth: { md: 420 } }}>
                {team.members.map((m) => (
                  <Tooltip key={m.code} title={`${m.name} · ${ROLE_LABEL[m.role] ?? m.role}`}>
                    <Box>
                      <Chip label={m.role} color={ACCENT.cyan} variant="soft" size="sm" />
                    </Box>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* KPI */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="วงรอบทั้งหมด" value={rounds.length} icon={EventRepeatIcon} color={ACCENT.violet} caption="รอบละ 2 เดือน" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="หัวข้อประเมิน" value={TOPICS.length} icon={ChecklistIcon} color={ACCENT.blue} caption="ให้คะแนน 5 ระดับ" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="อาจารย์ผู้ประเมิน" value={ADVISORS.length} icon={SupervisorAccountIcon} color={ACCENT.cyan} caption="แบ่งหัวข้อไม่ทับกัน" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="คะแนนเฉลี่ยล่าสุด"
            value={latestAvg ? `${latestAvg.avg.toFixed(2)} / 5` : '—'}
            icon={GradeIcon}
            color={ACCENT.green}
            caption={latestDone ? latestDone.label : 'ยังไม่มีรอบที่เสร็จ'}
            delta={
              latestAvg && prevAvg
                ? { value: Number((latestAvg.avg - prevAvg.avg).toFixed(2)), period: `จาก ${prevDone.label}` }
                : undefined
            }
          />
        </Grid>
      </Grid>

      {/* การแบ่งหัวข้อระหว่างอาจารย์ */}
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <RuleIcon fontSize="small" sx={{ color: ACCENT.violet }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>การแบ่งหัวข้อระหว่างอาจารย์ (ไม่ทับกัน)</Typography>
        </Stack>
        <Grid container spacing={2}>
          {ADVISORS.map((a) => (
            <Grid key={a.id} size={{ xs: 12, md: 4 }}>
              <AdvisorSplitCard advisor={a} rounds={rounds} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ตารางคะแนน หัวข้อ × วงรอบ */}
      <Card sx={softCard}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
            <AssessmentIcon fontSize="small" sx={{ color: ACCENT.violet }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>ผลการประเมินรายหัวข้อ × วงรอบ</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">คลิกที่คะแนนเพื่อดูข้อคิดเห็นและหลักฐานของรอบนั้น</Typography>

          <Box sx={{ overflowX: 'auto', mt: 2 }}>
            <Box sx={{ minWidth: 620 }}>
              {/* หัวตาราง */}
              <Stack direction="row" spacing={1} sx={{ px: 1, pb: 1, alignItems: 'center' }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>หัวข้อ</Typography>
                </Box>
                {rounds.map((r) => (
                  <Box key={r.id} sx={{ width: 64, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>R{r.no}</Typography>
                    <Chip
                      label={r.status === 'done' ? 'เสร็จ' : r.status === 'in_progress' ? 'กำลัง' : 'รอ'}
                      color={r.status === 'done' ? ACCENT.green : r.status === 'in_progress' ? ACCENT.amber : ACCENT.violet}
                      variant="soft"
                      size="sm"
                    />
                  </Box>
                ))}
                <Box sx={{ width: 44, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>แนวโน้ม</Typography>
                </Box>
              </Stack>

              {/* แถวหัวข้อ */}
              {TOPICS.map((topic) => {
                const advisor = advisorOfTopic(topic.id);
                return (
                  <Stack
                    key={topic.id}
                    direction="row"
                    spacing={1}
                    sx={{ px: 1, py: 0.75, alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}
                  >
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: alpha(advisor?.color ?? ACCENT.violet, 0.14),
                            color: advisor?.color ?? ACCENT.violet,
                          }}
                        >
                          {topic.no}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{topic.short}</Typography>
                          {advisor && (
                            <Typography variant="caption" color="text.secondary" noWrap>{advisor.name}</Typography>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                    {rounds.map((r) => (
                      <Box key={r.id} sx={{ width: 64, display: 'grid', placeItems: 'center' }}>
                        <ScoreCell
                          score={r.results[topic.id]?.score}
                          dim={r.status !== 'done'}
                          onClick={
                            r.results[topic.id]?.score != null || r.results[topic.id]?.comment
                              ? () => setCell({ round: r, topic })
                              : undefined
                          }
                        />
                      </Box>
                    ))}
                    <Box sx={{ width: 44, display: 'grid', placeItems: 'center' }}>
                      <TrendChip topicId={topic.id} rounds={rounds} />
                    </Box>
                  </Stack>
                );
              })}

              {/* แถวค่าเฉลี่ยรอบ */}
              <Stack
                direction="row"
                spacing={1}
                sx={{ px: 1, py: 1, alignItems: 'center', borderTop: '2px solid', borderColor: 'divider', mt: 0.5 }}
              >
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>ค่าเฉลี่ยวงรอบ</Typography>
                </Box>
                {rounds.map((r) => {
                  const { avg, scored } = roundAverage(r);
                  const meta = scoreMeta(scored > 0 ? avg : null);
                  return (
                    <Box key={r.id} sx={{ width: 64, textAlign: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: scored > 0 ? meta.color : 'text.disabled' }}>
                        {scored > 0 ? avg.toFixed(2) : '—'}
                      </Typography>
                    </Box>
                  );
                })}
                <Box sx={{ width: 44 }} />
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* เกณฑ์การให้คะแนน 5 ระดับ */}
      <Card sx={softCard}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <GradeIcon fontSize="small" sx={{ color: ACCENT.violet }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>เกณฑ์การให้คะแนน (Rating scale 5 ระดับ)</Typography>
          </Stack>
          <Grid container spacing={1.5}>
            {RATING_LEVELS.map((lv) => {
              const meta = scoreMeta(lv.level);
              return (
                <Grid key={lv.level} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Stack direction="row" spacing={1.25} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        bgcolor: alpha(meta.color, 0.14),
                        color: meta.color,
                      }}
                    >
                      {lv.level}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{lv.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{lv.description}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 1.5, color: 'text.secondary' }}>
            <LockIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">ผ่านที่ระดับ 3 ขึ้นไป · อนุญาตให้ครึ่งคะแนน (เช่น 1.5, 2.5)</Typography>
          </Stack>
        </CardContent>
      </Card>

      <CellDetailDialog team={team} round={cell?.round ?? null} topic={cell?.topic ?? null} onClose={() => setCell(null)} />
      <ScoreRoundDialog team={team} round={scoringRound} onClose={() => setScoringRound(null)} onSave={saveRound} />
    </Stack>
  );
}

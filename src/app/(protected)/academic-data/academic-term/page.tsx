'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SchoolIcon from '@mui/icons-material/School';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard } from '@/theme/surfaces';
import { ACADEMIC_YEARS, ACTIVE_SEMESTER_ID, type AcademicYear, type Semester } from '@/data/academicData';

const dateFmt = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' });

// --- กล่องเพิ่ม/แก้ไขปีการศึกษา ----------------------------------------------

function YearFormDialog({
  open,
  initial,
  existingYears,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: string;
  existingYears: string[];
  onClose: () => void;
  onSubmit: (year: string) => void;
}) {
  const [year, setYear] = React.useState(initial ?? '');
  const [touched, setTouched] = React.useState(false);

  const trimmed = year.trim();
  const duplicate = touched && trimmed !== '' && trimmed !== initial && existingYears.includes(trimmed);
  const empty = touched && trimmed === '';
  const error = empty || duplicate;
  const helper = empty ? 'กรุณากรอกปีการศึกษา' : duplicate ? 'มีปีการศึกษานี้อยู่แล้ว' : 'ปี พ.ศ. เช่น 2570';

  const submit = () => {
    setTouched(true);
    if (trimmed !== '' && !(trimmed !== initial && existingYears.includes(trimmed))) onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initial ? 'แก้ไขปีการศึกษา' : 'เพิ่มปีการศึกษา'}</DialogTitle>
      <DialogContent>
        <TextField
          label="ปีการศึกษา (พ.ศ.)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
          error={error}
          helperText={helper}
          fullWidth
          autoFocus
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>
          ยกเลิก
        </Button>
        <Button variant="solid" onClick={submit}>
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- กล่องเพิ่ม/แก้ไขภาคเรียน -------------------------------------------------

interface SemesterDraft {
  label: string;
  start: string;
  end: string;
}
const EMPTY_SEMESTER: SemesterDraft = { label: 'ภาคเรียนที่ 1', start: '', end: '' };

function SemesterFormDialog({
  open,
  yearLabel,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  yearLabel: string;
  initial?: SemesterDraft;
  onClose: () => void;
  onSubmit: (draft: SemesterDraft) => void;
}) {
  const [form, setForm] = React.useState<SemesterDraft>(initial ?? EMPTY_SEMESTER);
  const [touched, setTouched] = React.useState(false);

  const labelError = touched && !form.label.trim();
  const startError = touched && !form.start;
  const endError = touched && !form.end;
  const rangeError = touched && form.start !== '' && form.end !== '' && form.end < form.start;

  const submit = () => {
    setTouched(true);
    if (form.label.trim() && form.start && form.end && form.end >= form.start) {
      onSubmit({ ...form, label: form.label.trim() });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial ? 'แก้ไขภาคเรียน' : 'เพิ่มภาคเรียน'} · ปีการศึกษา {yearLabel}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="ภาคเรียน"
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            error={labelError}
            helperText={labelError ? 'กรุณาเลือกภาคเรียน' : ' '}
            fullWidth
          >
            <MenuItem value="ภาคเรียนที่ 1">ภาคเรียนที่ 1</MenuItem>
            <MenuItem value="ภาคเรียนที่ 2">ภาคเรียนที่ 2</MenuItem>
            <MenuItem value="ภาคฤดูร้อน">ภาคฤดูร้อน</MenuItem>
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="วันเริ่ม"
              type="date"
              value={form.start}
              onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))}
              error={startError}
              helperText={startError ? 'เลือกวันเริ่ม' : ' '}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="วันสิ้นสุด"
              type="date"
              value={form.end}
              onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))}
              error={endError || rangeError}
              helperText={endError ? 'เลือกวันสิ้นสุด' : rangeError ? 'ต้องไม่ก่อนวันเริ่ม' : ' '}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" color={ACCENT.violet} onClick={onClose}>
          ยกเลิก
        </Button>
        <Button variant="solid" onClick={submit}>
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AcademicTermPage() {
  const [years, setYears] = React.useState<AcademicYear[]>(ACADEMIC_YEARS);
  // เทอมที่ใช้งานอยู่ — เลือกได้ทีละหนึ่งเทอม เป็นแค่แท็กเบา ๆ บอกว่าคะแนนเป็นของรอบเรียนไหน
  const [activeId, setActiveId] = React.useState(ACTIVE_SEMESTER_ID);

  const allSemesters = React.useMemo(() => years.flatMap((y) => y.semesters), [years]);
  const active = allSemesters.find((s) => s.id === activeId);
  const activeYear = years.find((y) => y.semesters.some((s) => s.id === activeId))?.year;

  // สถานะอิงจากวันเริ่มของเทอมที่ใช้งานอยู่ — เทอมก่อนหน้าปิดแล้ว เทอมหลังจากนั้นยังไม่ถึง
  const statusOf = (semester: Semester): 'active' | 'closed' | 'upcoming' => {
    if (semester.id === activeId) return 'active';
    if (!active) return 'upcoming';
    return semester.start < active.start ? 'closed' : 'upcoming';
  };
  const STATUS_META = {
    active: { label: 'กำลังใช้งาน', color: ACCENT.green },
    closed: { label: 'ปิดแล้ว', color: ACCENT.violet },
    upcoming: { label: 'กำลังจะถึง', color: ACCENT.blue },
  } as const;

  const summary = {
    years: years.length,
    semesters: allSemesters.length,
    activeTerm: activeYear && active ? `${activeYear} / ${active.label.replace('ภาคเรียนที่ ', '')}` : '—',
  };

  // --- ปีการศึกษา: เพิ่ม/แก้ไข/ลบ ---
  const [yearDialog, setYearDialog] = React.useState<{ open: boolean; editing?: string }>({ open: false });
  const [yearKey, setYearKey] = React.useState(0);
  const [yearToDelete, setYearToDelete] = React.useState<AcademicYear | null>(null);

  const openAddYear = () => {
    setYearDialog({ open: true });
    setYearKey((k) => k + 1);
  };
  const openEditYear = (year: string) => {
    setYearDialog({ open: true, editing: year });
    setYearKey((k) => k + 1);
  };
  const submitYear = (value: string) => {
    setYears((prev) => {
      if (yearDialog.editing) {
        return prev.map((y) => (y.year === yearDialog.editing ? { ...y, year: value } : y));
      }
      // เรียงจากใหม่ไปเก่าให้เข้าชุดกับข้อมูลเดิม
      return [...prev, { year: value, semesters: [] }].sort((a, b) => b.year.localeCompare(a.year));
    });
    setYearDialog({ open: false });
  };
  const confirmDeleteYear = () => {
    if (yearToDelete) setYears((prev) => prev.filter((y) => y.year !== yearToDelete.year));
    setYearToDelete(null);
  };

  // --- ภาคเรียน: เพิ่ม/แก้ไข/ลบ ---
  const [semDialog, setSemDialog] = React.useState<{
    open: boolean;
    year: string;
    editing?: Semester;
  }>({ open: false, year: '' });
  const [semKey, setSemKey] = React.useState(0);
  const [semToDelete, setSemToDelete] = React.useState<{ year: string; sem: Semester } | null>(null);

  const openAddSemester = (year: string) => {
    setSemDialog({ open: true, year });
    setSemKey((k) => k + 1);
  };
  const openEditSemester = (year: string, sem: Semester) => {
    setSemDialog({ open: true, year, editing: sem });
    setSemKey((k) => k + 1);
  };
  const submitSemester = (draft: SemesterDraft) => {
    const { year, editing } = semDialog;
    setYears((prev) =>
      prev.map((y) => {
        if (y.year !== year) return y;
        if (editing) {
          return {
            ...y,
            semesters: y.semesters.map((s) => (s.id === editing.id ? { ...s, ...draft } : s)),
          };
        }
        const newSem: Semester = { id: `${year}-${Date.now()}`, ...draft };
        return {
          ...y,
          semesters: [...y.semesters, newSem].sort((a, b) => a.start.localeCompare(b.start)),
        };
      }),
    );
    setSemDialog({ open: false, year: '' });
  };
  const confirmDeleteSemester = () => {
    if (semToDelete) {
      setYears((prev) =>
        prev.map((y) =>
          y.year === semToDelete.year
            ? { ...y, semesters: y.semesters.filter((s) => s.id !== semToDelete.sem.id) }
            : y,
        ),
      );
    }
    setSemToDelete(null);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="ปีการศึกษา / ภาคเรียน"
        description="กำหนดปีการศึกษาและตั้งภาคเรียนที่ใช้งานอยู่ — ใช้เป็นแท็กบอกว่าคะแนนเป็นของรอบเรียนไหน ไม่ผูกกับข้อมูลอื่นลึก"
        actions={
          <Button variant="solid" startIcon={CalendarMonthIcon} onClick={openAddYear}>
            เพิ่มปีการศึกษา
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="ปีการศึกษาทั้งหมด" value={summary.years} icon={SchoolIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="ภาคเรียนทั้งหมด" value={summary.semesters} icon={DateRangeIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="เทอมที่ใช้งานอยู่" value={summary.activeTerm} icon={EventAvailableIcon} color={ACCENT.green} caption="ใช้กับการประเมินที่สร้างใหม่" />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        {years.map((y) => {
          const hasActive = y.semesters.some((s) => s.id === activeId);
          return (
            <Card key={y.year} sx={softCard}>
              <CardContent>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ปีการศึกษา {y.year}
                  </Typography>
                  {hasActive && <Chip size="sm" variant="solid" color={ACCENT.green} label="ปีปัจจุบัน" />}
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {y.semesters.length} ภาคเรียน
                  </Typography>
                  <Tooltip title="เพิ่มภาคเรียน">
                    <span>
                      <Button variant="ghost" color={ACCENT.blue} size="sm" iconOnly startIcon={AddIcon} aria-label="เพิ่มภาคเรียน" onClick={() => openAddSemester(y.year)} />
                    </span>
                  </Tooltip>
                  <Tooltip title="แก้ไขปีการศึกษา">
                    <span>
                      <Button variant="ghost" color={ACCENT.violet} size="sm" iconOnly startIcon={EditIcon} aria-label="แก้ไขปีการศึกษา" onClick={() => openEditYear(y.year)} />
                    </span>
                  </Tooltip>
                  <Tooltip title="ลบปีการศึกษา">
                    <span>
                      <Button variant="ghost" color={ACCENT.pink} size="sm" iconOnly startIcon={DeleteIcon} aria-label="ลบปีการศึกษา" onClick={() => setYearToDelete(y)} />
                    </span>
                  </Tooltip>
                </Stack>
                <Divider />
                {y.semesters.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    ยังไม่มีภาคเรียน — กดปุ่ม + เพื่อเพิ่ม
                  </Typography>
                ) : (
                  <Stack divider={<Divider flexItem />}>
                    {y.semesters.map((s) => {
                      const status = statusOf(s);
                      const isActive = status === 'active';
                      const meta = STATUS_META[status];
                      return (
                        <Stack
                          key={s.id}
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1.5}
                          sx={{
                            alignItems: { sm: 'center' },
                            py: 1.5,
                            px: 1.5,
                            mx: -1.5,
                            borderRadius: 2,
                            borderLeft: '3px solid',
                            borderLeftColor: isActive ? ACCENT.green : 'transparent',
                            bgcolor: isActive ? (t) => alpha(t.palette.success.main, 0.08) : 'transparent',
                          }}
                        >
                          <Box sx={{ minWidth: 140 }}>
                            <Typography sx={{ fontWeight: 600 }}>{s.label}</Typography>
                          </Box>
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexGrow: 1 }}>
                            <DateRangeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {dateFmt.format(new Date(s.start))} – {dateFmt.format(new Date(s.end))}
                            </Typography>
                          </Stack>
                          <Chip size="sm" variant={status === 'closed' ? 'outlined' : 'soft'} color={meta.color} label={meta.label} />
                          <Button
                            size="sm"
                            variant={isActive ? 'solid' : 'outlined'}
                            color={isActive ? ACCENT.green : ACCENT.violet}
                            startIcon={isActive ? CheckCircleIcon : RadioButtonUncheckedIcon}
                            onClick={() => setActiveId(s.id)}
                            disabled={isActive}
                            style={{ minWidth: 130 }}
                          >
                            {isActive ? 'ใช้งานอยู่' : 'ตั้งเป็นเทอมนี้'}
                          </Button>
                          <Tooltip title="แก้ไขภาคเรียน">
                            <span>
                              <Button variant="ghost" color={ACCENT.violet} size="sm" iconOnly startIcon={EditIcon} aria-label="แก้ไขภาคเรียน" onClick={() => openEditSemester(y.year, s)} />
                            </span>
                          </Tooltip>
                          <Tooltip title="ลบภาคเรียน">
                            <span>
                              <Button variant="ghost" color={ACCENT.pink} size="sm" iconOnly startIcon={DeleteIcon} aria-label="ลบภาคเรียน" onClick={() => setSemToDelete({ year: y.year, sem: s })} />
                            </span>
                          </Tooltip>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <YearFormDialog
        key={`year-${yearKey}`}
        open={yearDialog.open}
        initial={yearDialog.editing}
        existingYears={years.map((y) => y.year)}
        onClose={() => setYearDialog({ open: false })}
        onSubmit={submitYear}
      />

      <SemesterFormDialog
        key={`sem-${semKey}`}
        open={semDialog.open}
        yearLabel={semDialog.year}
        initial={
          semDialog.editing
            ? { label: semDialog.editing.label, start: semDialog.editing.start, end: semDialog.editing.end }
            : undefined
        }
        onClose={() => setSemDialog({ open: false, year: '' })}
        onSubmit={submitSemester}
      />

      <Dialog open={Boolean(yearToDelete)} onClose={() => setYearToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ลบปีการศึกษา</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ลบ <strong>ปีการศึกษา {yearToDelete?.year}</strong>
            {yearToDelete?.semesters.length ? ` พร้อมภาคเรียนอีก ${yearToDelete.semesters.length} รายการ` : ''}? การกระทำนี้ย้อนกลับไม่ได้
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="ghost" color={ACCENT.violet} onClick={() => setYearToDelete(null)}>
            ยกเลิก
          </Button>
          <Button variant="solid" color={ACCENT.pink} onClick={confirmDeleteYear}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(semToDelete)} onClose={() => setSemToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ลบภาคเรียน</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ลบ <strong>{semToDelete?.sem.label}</strong> ปีการศึกษา {semToDelete?.year}? การกระทำนี้ย้อนกลับไม่ได้
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="ghost" color={ACCENT.violet} onClick={() => setSemToDelete(null)}>
            ยกเลิก
          </Button>
          <Button variant="solid" color={ACCENT.pink} onClick={confirmDeleteSemester}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

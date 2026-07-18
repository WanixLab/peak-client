'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ShortTextIcon from '@mui/icons-material/ShortText';
import NotesIcon from '@mui/icons-material/Notes';
import NumbersIcon from '@mui/icons-material/Numbers';
import EventIcon from '@mui/icons-material/Event';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import StarIcon from '@mui/icons-material/Star';
import GestureIcon from '@mui/icons-material/Gesture';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import RuleIcon from '@mui/icons-material/Rule';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard } from '@/theme/surfaces';
import { TOPICS } from '@/data/teamOralEvaluation';

// --- โครงข้อมูล -------------------------------------------------------------

type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'rating'
  | 'signature';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  helpText?: string;
  placeholder?: string;
  required: boolean;
  /** ตัวเลือก — dropdown / radio / checkbox */
  options?: string[];
  /** ขอบเขตตัวเลข — number */
  min?: number;
  max?: number;
  /** ขอบบนของสเกลการให้คะแนน */
  scaleMax?: number;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FieldTypeMeta {
  label: string;
  icon: typeof ShortTextIcon;
  color: string;
  group: 'basic' | 'choice' | 'advanced';
  hasOptions?: boolean;
}

const FIELD_TYPES: Record<FieldType, FieldTypeMeta> = {
  text: { label: 'ข้อความสั้น', icon: ShortTextIcon, color: ACCENT.blue, group: 'basic' },
  textarea: { label: 'ย่อหน้า', icon: NotesIcon, color: ACCENT.blue, group: 'basic' },
  number: { label: 'ตัวเลข', icon: NumbersIcon, color: ACCENT.cyan, group: 'basic' },
  date: { label: 'วันที่', icon: EventIcon, color: ACCENT.cyan, group: 'basic' },
  dropdown: { label: 'เมนูเลือก', icon: ArrowDropDownCircleIcon, color: ACCENT.violet, group: 'choice', hasOptions: true },
  radio: { label: 'เลือกอย่างเดียว', icon: RadioButtonCheckedIcon, color: ACCENT.violet, group: 'choice', hasOptions: true },
  checkbox: { label: 'เลือกหลายอย่าง', icon: CheckBoxIcon, color: ACCENT.violet, group: 'choice', hasOptions: true },
  rating: { label: 'สเกลให้คะแนน', icon: StarIcon, color: ACCENT.amber, group: 'advanced' },
  file: { label: 'อัปโหลดไฟล์', icon: UploadFileIcon, color: ACCENT.green, group: 'advanced' },
  signature: { label: 'ลายมือชื่อ', icon: GestureIcon, color: ACCENT.pink, group: 'advanced' },
};

const FIELD_GROUPS: { key: FieldTypeMeta['group']; label: string }[] = [
  { key: 'basic', label: 'พื้นฐาน' },
  { key: 'choice', label: 'ตัวเลือก' },
  { key: 'advanced', label: 'ขั้นสูง' },
];

let seq = 100;
const uid = (p: string) => `${p}${(seq += 1)}`;

function createField(type: FieldType): FormField {
  const base = { id: uid('f'), type, required: false } as FormField;
  const meta = FIELD_TYPES[type];
  if (meta.hasOptions) return { ...base, label: meta.label, options: ['ตัวเลือก 1', 'ตัวเลือก 2', 'ตัวเลือก 3'] };
  if (type === 'rating') return { ...base, label: 'คะแนนโดยรวม', scaleMax: 5 };
  if (type === 'number') return { ...base, label: 'ตัวเลข', min: 0, max: 100 };
  return { ...base, label: meta.label };
}

// --- แบบฟอร์มตัวอย่าง -------------------------------------------------------

const SEED_SECTIONS: FormSection[] = [
  {
    id: 's1',
    title: 'ภาพรวมโปรเจกต์',
    description: 'ข้อมูลพื้นฐานของโปรเจกต์ที่ถูกประเมิน',
    fields: [
      { id: 'f1', type: 'text', label: 'ชื่อโปรเจกต์', required: true, placeholder: 'เช่น ระบบเช็กชื่ออัจฉริยะ' },
      { id: 'f2', type: 'dropdown', label: 'หมวดหมู่โปรเจกต์', required: true, options: ['วิจัย', 'นวัตกรรม', 'บริการ', 'สตาร์ทอัพ'] },
      { id: 'f3', type: 'textarea', label: 'บทคัดย่อ', helpText: 'สรุปโปรเจกต์สั้น ๆ (ไม่เกิน 300 คำ)', required: false },
    ],
  },
  {
    id: 's2',
    title: 'เกณฑ์การประเมิน',
    description: 'ให้คะแนนแต่ละมิติของโปรเจกต์',
    fields: [
      { id: 'f4', type: 'rating', label: 'ความคิดริเริ่ม & นวัตกรรม', required: true, scaleMax: 5 },
      { id: 'f5', type: 'rating', label: 'การดำเนินการทางเทคนิค', required: true, scaleMax: 5 },
      { id: 'f6', type: 'radio', label: 'บรรลุวัตถุประสงค์หรือไม่?', required: true, options: ['ครบถ้วน', 'บางส่วน', 'ไม่บรรลุ'] },
    ],
  },
  {
    id: 's3',
    title: 'ไฟล์แนบ & การลงนาม',
    fields: [
      { id: 'f7', type: 'file', label: 'เอกสารประกอบ', helpText: 'PDF หรือสไลด์ ไม่เกิน 20 MB', required: false },
      { id: 'f8', type: 'signature', label: 'ลายมือชื่อผู้ประเมิน', required: true },
    ],
  },
];

const CATEGORIES = ['ประเมินโปรเจกต์', 'ประเมินตนเอง', 'เพื่อนประเมิน', 'ที่ปรึกษาประเมิน', 'แบบสำรวจ'];

// --- เทมเพลต → พิมพ์เขียวช่อง (เปิดจากคลังเทมเพลตด้วย ?template=<id>) --------

const ratingField = (label: string): FormField => ({ id: uid('f'), type: 'rating', label, required: true, scaleMax: 5 });
const commentField = (): FormField => ({
  id: uid('f'),
  type: 'textarea',
  label: 'ข้อคิดเห็น / สิ่งที่ปรับปรุงได้',
  placeholder: 'ระบุจุดเด่น จุดที่ควรปรับปรุง หรือแนบลิงก์หลักฐาน',
  required: false,
});

function ratingSection(title: string, labels: string[], signature = false): FormSection {
  const fields = labels.map(ratingField);
  if (signature) fields.push({ id: uid('f'), type: 'signature', label: 'ลายมือชื่อผู้ประเมิน', required: true });
  return { id: uid('s'), title, fields };
}

/** แบบ Oral: 1 หัวข้อ = 1 ส่วน (สเกลให้คะแนน + ช่องความเห็น) + ลายมือชื่อกรรมการ */
function buildOralSections(): FormSection[] {
  const sections: FormSection[] = TOPICS.map((t) => ({
    id: uid('s'),
    title: `${t.no}. ${t.short}`,
    description: t.name,
    fields: [ratingField(t.name), commentField()],
  }));
  sections[sections.length - 1].fields.push({ id: uid('f'), type: 'signature', label: 'ลายมือชื่อกรรมการ', required: true });
  return sections;
}

interface TemplateBlueprint {
  name: string;
  category: string;
  /** สร้างส่วน/ช่องใหม่ (มี id ใหม่ทุกครั้ง) */
  build: () => FormSection[];
}

/** คีย์ตรงกับ id ของเทมเพลตในคลังเทมเพลต (`forms/templates`). */
const TEMPLATE_BLUEPRINTS: Record<string, TemplateBlueprint> = {
  t1: {
    name: 'แบบประเมินโปรเจกต์จบ',
    category: 'ประเมินโปรเจกต์',
    build: () => [ratingSection('เกณฑ์การประเมิน', ['ความคิดริเริ่ม & นวัตกรรม', 'การดำเนินการทางเทคนิค', 'การนำเสนอ', 'เอกสาร'])],
  },
  t2: {
    name: 'แบบประเมินการมีส่วนร่วมของเพื่อน',
    category: 'เพื่อนประเมิน',
    build: () => [ratingSection('การมีส่วนร่วม', ['การทำงานร่วมกัน', 'ความน่าเชื่อถือ', 'การมีส่วนร่วม'])],
  },
  t3: {
    name: 'แบบประเมินตนเอง (สะท้อนคิด)',
    category: 'ประเมินตนเอง',
    build: () => [
      {
        id: uid('s'),
        title: 'สะท้อนคิด',
        fields: [
          { id: uid('f'), type: 'textarea', label: 'เป้าหมายที่ตั้งไว้', required: true },
          { id: uid('f'), type: 'textarea', label: 'สิ่งที่ได้เรียนรู้', required: true },
          { id: uid('f'), type: 'textarea', label: 'ก้าวต่อไป', required: false },
        ],
      },
    ],
  },
  t4: {
    name: 'แบบอนุมัติขั้นสุดท้ายโดยที่ปรึกษา',
    category: 'ที่ปรึกษาประเมิน',
    build: () => [ratingSection('การประเมินของที่ปรึกษา', ['บรรลุวัตถุประสงค์', 'ระเบียบวิธี', 'ผลกระทบ'], true)],
  },
  t5: {
    name: 'แบบสำรวจความพึงพอใจรายวิชา',
    category: 'แบบสำรวจ',
    build: () => [ratingSection('ความพึงพอใจ', ['เนื้อหารายวิชา', 'ผู้สอน', 'สื่อการสอน', 'การวัดผล', 'ภาพรวม'])],
  },
  t6: {
    name: 'แบบให้คะแนนพิตช์นวัตกรรม',
    category: 'ประเมินโปรเจกต์',
    build: () => [ratingSection('เกณฑ์พิตช์', ['ความเหมาะกับปัญหา', 'ศักยภาพตลาด'])],
  },
  t7: {
    name: 'แบบประเมินความก้าวหน้าโครงงาน (Oral)',
    category: 'ที่ปรึกษาประเมิน',
    build: buildOralSections,
  },
};

// --- แถวช่องแบบลากเรียงได้ ---------------------------------------------------

function SortableField({
  field,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  field: FormField;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const meta = FIELD_TYPES[field.type];
  const Icon = meta.icon;

  return (
    <Box
      ref={setNodeRef}
      onClick={onSelect}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        zIndex: isDragging ? 2 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1.25,
        borderRadius: 2,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: (t) => (selected ? alpha(t.palette.primary.main, 0.06) : 'background.paper'),
        boxShadow: selected ? (t) => `0 0 0 1px ${t.palette.primary.main}` : 'none',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        sx={{ display: 'flex', color: 'text.disabled', cursor: 'grab', touchAction: 'none', '&:active': { cursor: 'grabbing' } }}
        aria-label="ลากเพื่อจัดเรียง"
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>

      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(meta.color, 0.12),
          color: meta.color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>

      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {field.label || 'ช่องไม่มีชื่อ'}
          </Typography>
          {field.required && (
            <Typography component="span" sx={{ color: 'error.main', fontWeight: 700, lineHeight: 1 }}>
              *
            </Typography>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {meta.label}
          {meta.hasOptions && field.options ? ` · ${field.options.length} ตัวเลือก` : ''}
        </Typography>
      </Box>

      <Stack direction="row" sx={{ flexShrink: 0 }}>
        <Tooltip title="ทำสำเนา">
          <Button variant="ghost" color={meta.color} iconOnly size="sm" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </Button>
        </Tooltip>
        <Tooltip title="ลบ">
          <Button variant="ghost" color={ACCENT.pink} iconOnly size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </Button>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// --- พรีวิวช่อง (ใช้ในกล่องดูตัวอย่าง) --------------------------------------

function RatingPreview({ scaleMax = 5 }: { scaleMax?: number }) {
  const [value, setValue] = React.useState(0);
  return (
    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
      {Array.from({ length: scaleMax }, (_, i) => i + 1).map((n) => (
        <Box
          key={n}
          component="button"
          type="button"
          onClick={() => setValue(n)}
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid',
            borderColor: value >= n ? 'primary.main' : 'divider',
            bgcolor: (t) => (value >= n ? alpha(t.palette.primary.main, 0.12) : 'transparent'),
            color: value >= n ? 'primary.main' : 'text.secondary',
          }}
        >
          {n}
        </Box>
      ))}
    </Stack>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  const label = (
    <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 0.75, display: 'block' }}>
      {field.label || 'ช่องไม่มีชื่อ'}
      {field.required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
    </FormLabel>
  );

  return (
    <Box>
      {field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'rating' && field.type !== 'signature' && field.type !== 'file' && label}

      {field.type === 'text' && <TextField fullWidth size="small" placeholder={field.placeholder} />}
      {field.type === 'textarea' && <TextField fullWidth size="small" multiline minRows={3} placeholder={field.placeholder} />}
      {field.type === 'number' && (
        <TextField fullWidth size="small" type="number" placeholder={field.placeholder} slotProps={{ htmlInput: { min: field.min, max: field.max } }} />
      )}
      {field.type === 'date' && <TextField fullWidth size="small" type="date" slotProps={{ inputLabel: { shrink: true } }} />}
      {field.type === 'dropdown' && (
        <TextField select fullWidth size="small" defaultValue="">
          <MenuItem value="">เลือก…</MenuItem>
          {(field.options ?? []).map((o, i) => (
            <MenuItem key={i} value={o}>{o}</MenuItem>
          ))}
        </TextField>
      )}
      {field.type === 'radio' && (
        <FormControl>
          {label}
          <RadioGroup>
            {(field.options ?? []).map((o, i) => (
              <FormControlLabel key={i} value={o} control={<Radio size="small" />} label={o} />
            ))}
          </RadioGroup>
        </FormControl>
      )}
      {field.type === 'checkbox' && (
        <FormControl>
          {label}
          <Stack>
            {(field.options ?? []).map((o, i) => (
              <FormControlLabel key={i} control={<Checkbox size="small" />} label={o} />
            ))}
          </Stack>
        </FormControl>
      )}
      {field.type === 'rating' && (
        <Box>
          {label}
          <RatingPreview scaleMax={field.scaleMax} />
        </Box>
      )}
      {field.type === 'file' && (
        <Box>
          {label}
          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2.5,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <UploadFileIcon sx={{ fontSize: 26, mb: 0.5, opacity: 0.7 }} />
            <Typography variant="body2">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่</Typography>
          </Box>
        </Box>
      )}
      {field.type === 'signature' && (
        <Box>
          {label}
          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              height: 96,
              display: 'grid',
              placeItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
              <GestureIcon />
              <Typography variant="caption">ลงลายมือชื่อที่นี่</Typography>
            </Stack>
          </Box>
        </Box>
      )}

      {field.helpText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {field.helpText}
        </Typography>
      )}
    </Box>
  );
}

// --- แผงชนิดช่อง ------------------------------------------------------------

function Palette({ onAdd }: { onAdd: (type: FieldType) => void }) {
  return (
    <Card sx={[softCard, { position: { lg: 'sticky' }, top: { lg: 16 } }]}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <TuneIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            ชนิดของช่อง
          </Typography>
        </Stack>
        <Stack spacing={2}>
          {FIELD_GROUPS.map((group) => (
            <Box key={group.key}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {group.label}
              </Typography>
              <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                {(Object.keys(FIELD_TYPES) as FieldType[])
                  .filter((t) => FIELD_TYPES[t].group === group.key)
                  .map((t) => {
                    const meta = FIELD_TYPES[t];
                    const Icon = meta.icon;
                    return (
                      <Box
                        key={t}
                        component="button"
                        type="button"
                        onClick={() => onAdd(t)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          width: '100%',
                          p: 0.9,
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          textAlign: 'left',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'transparent',
                          transition: 'all .15s',
                          '&:hover': {
                            borderColor: meta.color,
                            bgcolor: alpha(meta.color, 0.06),
                          },
                        }}
                      >
                        <Box sx={{ width: 26, height: 26, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: alpha(meta.color, 0.12), color: meta.color }}>
                          <Icon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                          {meta.label}
                        </Typography>
                        <AddIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </Box>
                    );
                  })}
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- ตัวแก้ไขตัวเลือก --------------------------------------------------------

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        ตัวเลือก
      </Typography>
      {options.map((opt, i) => (
        <Stack key={i} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            fullWidth
            value={opt}
            onChange={(e) => onChange(options.map((o, idx) => (idx === i ? e.target.value : o)))}
          />
          <Button
            variant="ghost"
            color={ACCENT.pink}
            iconOnly
            size="sm"
            disabled={options.length <= 1}
            onClick={() => onChange(options.filter((_, idx) => idx !== i))}
          >
            <DeleteOutlineIcon fontSize="small" />
          </Button>
        </Stack>
      ))}
      <Button variant="ghost" color={ACCENT.violet} size="sm" startIcon={AddIcon} onClick={() => onChange([...options, `ตัวเลือก ${options.length + 1}`])} style={{ alignSelf: 'flex-start' }}>
        เพิ่มตัวเลือก
      </Button>
    </Stack>
  );
}

// --- แผงคุณสมบัติ ------------------------------------------------------------

function Inspector({
  field,
  sections,
  sectionId,
  onChange,
  onMoveSection,
}: {
  field: FormField | null;
  sections: FormSection[];
  sectionId: string | null;
  onChange: (patch: Partial<FormField>) => void;
  onMoveSection: (target: string) => void;
}) {
  if (!field) {
    return (
      <Card sx={[softCard, { position: { lg: 'sticky' }, top: { lg: 16 } }]}>
        <CardContent>
          <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <SettingsIcon sx={{ fontSize: 40, opacity: 0.4 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              ยังไม่ได้เลือกช่อง
            </Typography>
            <Typography variant="caption">
              เพิ่มช่องจากแผงด้านซ้าย หรือเลือกช่องบนพื้นที่ทำงานเพื่อแก้ไขคุณสมบัติ
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const meta = FIELD_TYPES[field.type];

  return (
    <Card sx={[softCard, { position: { lg: 'sticky' }, top: { lg: 16 } }]}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <RuleIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            คุณสมบัติของช่อง
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip label={meta.label} color={meta.color} variant="soft" size="sm" />
        </Stack>

        <Stack spacing={2}>
          <TextField label="ป้ายชื่อ" size="small" fullWidth value={field.label} onChange={(e) => onChange({ label: e.target.value })} />
          <TextField label="ข้อความช่วยเหลือ" size="small" fullWidth value={field.helpText ?? ''} onChange={(e) => onChange({ helpText: e.target.value })} placeholder="คำแนะนำที่แสดงใต้ช่อง (ไม่บังคับ)" />

          {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
            <TextField label="ข้อความตัวอย่าง" size="small" fullWidth value={field.placeholder ?? ''} onChange={(e) => onChange({ placeholder: e.target.value })} />
          )}

          {meta.hasOptions && (
            <OptionsEditor options={field.options ?? []} onChange={(options) => onChange({ options })} />
          )}

          {field.type === 'number' && (
            <Stack direction="row" spacing={1}>
              <TextField label="ต่ำสุด" size="small" type="number" fullWidth value={field.min ?? ''} onChange={(e) => onChange({ min: e.target.value === '' ? undefined : Number(e.target.value) })} />
              <TextField label="สูงสุด" size="small" type="number" fullWidth value={field.max ?? ''} onChange={(e) => onChange({ max: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </Stack>
          )}

          {field.type === 'rating' && (
            <TextField select label="สเกล" size="small" fullWidth value={field.scaleMax ?? 5} onChange={(e) => onChange({ scaleMax: Number(e.target.value) })}>
              <MenuItem value={3}>1 – 3</MenuItem>
              <MenuItem value={5}>1 – 5</MenuItem>
              <MenuItem value={10}>1 – 10</MenuItem>
            </TextField>
          )}

          <Divider />

          <FormControlLabel
            control={<Switch checked={field.required} onChange={(e) => onChange({ required: e.target.checked })} />}
            label={<Typography variant="body2">ช่องบังคับกรอก</Typography>}
          />

          <TextField select label="ส่วน" size="small" fullWidth value={sectionId ?? ''} onChange={(e) => onMoveSection(e.target.value)}>
            {sections.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- หน้าเพจ -----------------------------------------------------------------

function FormBuilder() {
  const theme = useTheme();
  const searchParams = useSearchParams();

  // เปิดจากคลังเทมเพลต (?template=<id>) → คำนวณสถานะเริ่มต้นจากพิมพ์เขียวครั้งเดียว
  const initial = React.useMemo(() => {
    const blueprint = TEMPLATE_BLUEPRINTS[searchParams.get('template') ?? ''];
    if (!blueprint) {
      return { name: 'แบบประเมินโปรเจกต์', category: CATEGORIES[0], sections: SEED_SECTIONS, loaded: null as string | null };
    }
    return { name: blueprint.name, category: blueprint.category, sections: blueprint.build(), loaded: blueprint.name };
    // สร้างครั้งเดียวตอน mount — ตั้งใจไม่ผูกกับ searchParams เพื่อไม่ให้ id ช่องเปลี่ยนระหว่างแก้ไข
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formName, setFormName] = React.useState(initial.name);
  const [category, setCategory] = React.useState(initial.category);
  const [version, setVersion] = React.useState(3);
  const [published, setPublished] = React.useState(false);
  const [sections, setSections] = React.useState<FormSection[]>(initial.sections);
  const [activeSectionId, setActiveSectionId] = React.useState<string>(initial.sections[0]?.id ?? '');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const loadedTemplate = initial.loaded;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const allFields = React.useMemo(() => sections.flatMap((s) => s.fields), [sections]);
  const selected = allFields.find((f) => f.id === selectedId) ?? null;
  const selectedSectionId = sections.find((s) => s.fields.some((f) => f.id === selectedId))?.id ?? null;

  const stats = React.useMemo(
    () => ({
      sections: sections.length,
      fields: allFields.length,
      required: allFields.filter((f) => f.required).length,
    }),
    [sections, allFields],
  );

  // --- การแก้ไขข้อมูล ---
  const addField = (type: FieldType) => {
    const field = createField(type);
    setSections((prev) =>
      prev.map((s) => (s.id === activeSectionId ? { ...s, fields: [...s.fields, field] } : s)),
    );
    setSelectedId(field.id);
  };

  const patchField = (patch: Partial<FormField>) => {
    if (!selectedId) return;
    setSections((prev) =>
      prev.map((s) => ({ ...s, fields: s.fields.map((f) => (f.id === selectedId ? { ...f, ...patch } : f)) })),
    );
  };

  const deleteField = (id: string) => {
    setSections((prev) => prev.map((s) => ({ ...s, fields: s.fields.filter((f) => f.id !== id) })));
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const duplicateField = (id: string) => {
    const copy = { ...allFields.find((f) => f.id === id)!, id: uid('f') };
    setSections((prev) =>
      prev.map((s) => {
        const idx = s.fields.findIndex((f) => f.id === id);
        if (idx === -1) return s;
        const next = [...s.fields];
        next.splice(idx + 1, 0, copy);
        return { ...s, fields: next };
      }),
    );
    setSelectedId(copy.id);
  };

  const moveFieldToSection = (target: string) => {
    if (!selected || !selectedSectionId || target === selectedSectionId) return;
    const field = selected;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === selectedSectionId) return { ...s, fields: s.fields.filter((f) => f.id !== field.id) };
        if (s.id === target) return { ...s, fields: [...s.fields, field] };
        return s;
      }),
    );
    setActiveSectionId(target);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) =>
      prev.map((s) => {
        const oldIndex = s.fields.findIndex((f) => f.id === active.id);
        const newIndex = s.fields.findIndex((f) => f.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return s;
        return { ...s, fields: arrayMove(s.fields, oldIndex, newIndex) };
      }),
    );
  };

  const addSection = () => {
    const s: FormSection = { id: uid('s'), title: `ส่วนที่ ${sections.length + 1}`, fields: [] };
    setSections((prev) => [...prev, s]);
    setActiveSectionId(s.id);
  };

  const renameSection = (id: string, title: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));

  const deleteSection = (id: string) => {
    setSections((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
    setActiveSectionId((cur) => (cur === id ? sections[0].id : cur));
  };

  const publish = () => {
    setPublished(true);
    setVersion((v) => v + 1);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="สร้างแบบฟอร์ม"
        description="ออกแบบแบบฟอร์มประเมินแบบไดนามิกด้วยการลากวางช่อง ส่วน และการตรวจสอบความถูกต้อง"
        actions={
          <>
            <Button variant="outlined" color={ACCENT.violet} startIcon={VisibilityIcon} onClick={() => setPreviewOpen(true)}>
              ดูตัวอย่าง
            </Button>
            <Button variant="soft" color={ACCENT.violet} startIcon={SaveIcon}>
              บันทึกร่าง
            </Button>
            <Button variant="solid" color={ACCENT.violet} startIcon={PublishIcon} onClick={publish}>
              เผยแพร่
            </Button>
          </>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="จำนวนส่วน" value={stats.sections} icon={ViewAgendaIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="จำนวนช่อง" value={stats.fields} icon={LayersIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="ช่องบังคับกรอก" value={stats.required} icon={RuleIcon} color={ACCENT.amber} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="เวอร์ชัน"
            value={`v${version}`}
            icon={AssignmentIcon}
            color={published ? ACCENT.green : ACCENT.cyan}
            caption={published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
          />
        </Grid>
      </Grid>

      {/* แถบข้อมูลแบบฟอร์ม */}
      <Card sx={softCard}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <TextField
              label="ชื่อแบบฟอร์ม"
              size="small"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <TextField select label="หมวดหมู่" size="small" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 220 }}>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            {loadedTemplate && (
              <Chip label={`จากเทมเพลต: ${loadedTemplate}`} color={ACCENT.cyan} variant="soft" icon={ContentCopyIcon} />
            )}
            <Chip
              label={published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
              color={published ? ACCENT.green : ACCENT.violet}
              variant={published ? 'solid' : 'soft'}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* พื้นที่ทำงาน: แผงชนิดช่อง · พื้นที่วาง · แผงคุณสมบัติ */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ width: { xs: '100%', lg: 232 }, flexShrink: 0 }}>
          <Palette onAdd={addField} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Stack spacing={2}>
              {sections.map((section) => {
                const isActive = section.id === activeSectionId;
                return (
                  <Card
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    sx={[softCard, { borderTop: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent' }]}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 26,
                            borderRadius: 1,
                            bgcolor: isActive ? 'primary.main' : 'divider',
                            flexShrink: 0,
                          }}
                        />
                        <TextField
                          variant="standard"
                          value={section.title}
                          onChange={(e) => renameSection(section.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          slotProps={{ input: { disableUnderline: true, sx: { fontWeight: 700, fontSize: '1.05rem' } } }}
                          sx={{ flexGrow: 1 }}
                        />
                        <Chip label={`${section.fields.length} ช่อง`} color={ACCENT.violet} variant="outlined" size="sm" />
                        <Tooltip title="ลบส่วน">
                          <span>
                            <Button
                              variant="ghost"
                              color={ACCENT.pink}
                              iconOnly
                              size="sm"
                              disabled={sections.length <= 1}
                              onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                      {section.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, pl: 2 }}>
                          {section.description}
                        </Typography>
                      )}

                      <SortableContext items={section.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {section.fields.length === 0 ? (
                            <Box
                              sx={{
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                py: 3,
                                textAlign: 'center',
                                color: 'text.secondary',
                              }}
                            >
                              <Typography variant="body2">
                                {isActive ? 'คลิกชนิดช่องทางซ้ายเพื่อเพิ่มที่นี่' : 'ว่างเปล่า — เลือกส่วนนี้ แล้วเพิ่มช่อง'}
                              </Typography>
                            </Box>
                          ) : (
                            section.fields.map((field) => (
                              <SortableField
                                key={field.id}
                                field={field}
                                selected={field.id === selectedId}
                                onSelect={() => { setSelectedId(field.id); setActiveSectionId(section.id); }}
                                onDelete={() => deleteField(field.id)}
                                onDuplicate={() => duplicateField(field.id)}
                              />
                            ))
                          )}
                        </Stack>
                      </SortableContext>
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                variant="outlined"
                color={ACCENT.violet}
                startIcon={AddIcon}
                onClick={addSection}
                fullWidth
                style={{ borderStyle: 'dashed', paddingTop: 10, paddingBottom: 10 }}
              >
                เพิ่มส่วน
              </Button>
            </Stack>
          </DndContext>
        </Box>

        <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
          <Inspector
            field={selected}
            sections={sections}
            sectionId={selectedSectionId}
            onChange={patchField}
            onMoveSection={moveFieldToSection}
          />
        </Box>
      </Box>

      {/* กล่องดูตัวอย่าง — จำลองหน้าตาแบบฟอร์มที่ผู้ตอบเห็นจริง */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
      >
        {/* หัวกล่อง: แถบไล่สีมีชื่อฟอร์ม หมวด และป้ายกำกับว่าเป็นตัวอย่าง */}
        <Box
          sx={{
            position: 'relative',
            px: 3,
            py: 2.5,
            color: 'common.white',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.dark ?? theme.palette.primary.main, 0.85)})`,
          }}
        >
          <IconButton
            onClick={() => setPreviewOpen(false)}
            aria-label="ปิด"
            size="small"
            sx={{ position: 'absolute', top: 12, right: 12, color: alpha('#fff', 0.9), '&:hover': { bgcolor: alpha('#fff', 0.15) } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.375,
              borderRadius: 1,
              bgcolor: alpha('#fff', 0.2),
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <VisibilityIcon sx={{ fontSize: 14 }} />
            ตัวอย่าง
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.25, lineHeight: 1.2 }}>
            {formName || 'แบบฟอร์มไม่มีชื่อ'}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', color: alpha('#fff', 0.92) }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{category}</Typography>
            <Typography variant="caption">·</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{stats.sections} ส่วน · {stats.fields} ช่อง</Typography>
            <Typography variant="caption">·</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>v{version} {published ? '· เผยแพร่แล้ว' : '· ฉบับร่าง'}</Typography>
          </Stack>
        </Box>

        <DialogContent sx={{ bgcolor: (t) => alpha(t.palette.text.primary, 0.02), p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5} sx={{ maxWidth: 640, mx: 'auto' }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'error.main' }}>
              <Box component="span" sx={{ fontWeight: 700 }}>*</Box>
              <Typography variant="caption" color="text.secondary">ช่องที่มีเครื่องหมายดอกจันจำเป็นต้องกรอก</Typography>
            </Stack>

            {sections.map((section, i) => (
              <Card key={section.id} variant="outlined" sx={{ borderRadius: 2.5, borderColor: 'divider' }}>
                <Box sx={{ height: 4, bgcolor: 'primary.main' }} />
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: section.description ? 0.5 : 2 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        flexShrink: 0,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                        color: 'primary.main',
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {section.title}
                      </Typography>
                      {section.description && (
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Stack spacing={2.5} sx={{ mt: 2 }}>
                    {section.fields.length === 0 ? (
                      <Typography variant="body2" color="text.disabled">ไม่มีช่องในส่วนนี้</Typography>
                    ) : (
                      section.fields.map((field) => <FieldPreview key={field.id} field={field} />)
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.disabled' }}>
                <CheckCircleIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">พรีวิว — ปุ่มส่งถูกปิดไว้</Typography>
              </Stack>
              <Button variant="solid" color={ACCENT.violet} size="lg" disabled>
                ส่งการประเมิน
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

export default function FormBuilderPage() {
  return (
    <React.Suspense fallback={null}>
      <FormBuilder />
    </React.Suspense>
  );
}

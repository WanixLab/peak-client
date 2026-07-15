'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
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
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import RuleIcon from '@mui/icons-material/Rule';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PageHeader from '@/components/common/PageHeader';
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

// --- Domain model -----------------------------------------------------------

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
  /** Choice options — dropdown / radio / checkbox. */
  options?: string[];
  /** Numeric bounds — number. */
  min?: number;
  max?: number;
  /** Upper bound of the rating scale. */
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
  group: 'Basic' | 'Choice' | 'Advanced';
  hasOptions?: boolean;
}

const FIELD_TYPES: Record<FieldType, FieldTypeMeta> = {
  text: { label: 'Short text', icon: ShortTextIcon, color: ACCENT.blue, group: 'Basic' },
  textarea: { label: 'Paragraph', icon: NotesIcon, color: ACCENT.blue, group: 'Basic' },
  number: { label: 'Number', icon: NumbersIcon, color: ACCENT.cyan, group: 'Basic' },
  date: { label: 'Date', icon: EventIcon, color: ACCENT.cyan, group: 'Basic' },
  dropdown: { label: 'Dropdown', icon: ArrowDropDownCircleIcon, color: ACCENT.violet, group: 'Choice', hasOptions: true },
  radio: { label: 'Single choice', icon: RadioButtonCheckedIcon, color: ACCENT.violet, group: 'Choice', hasOptions: true },
  checkbox: { label: 'Checkboxes', icon: CheckBoxIcon, color: ACCENT.violet, group: 'Choice', hasOptions: true },
  rating: { label: 'Rating scale', icon: StarIcon, color: ACCENT.amber, group: 'Advanced' },
  file: { label: 'File upload', icon: UploadFileIcon, color: ACCENT.green, group: 'Advanced' },
  signature: { label: 'Signature', icon: GestureIcon, color: ACCENT.pink, group: 'Advanced' },
};

const FIELD_GROUPS: FieldTypeMeta['group'][] = ['Basic', 'Choice', 'Advanced'];

let seq = 100;
const uid = (p: string) => `${p}${(seq += 1)}`;

function createField(type: FieldType): FormField {
  const base = { id: uid('f'), type, required: false } as FormField;
  const meta = FIELD_TYPES[type];
  if (meta.hasOptions) return { ...base, label: meta.label, options: ['Option 1', 'Option 2', 'Option 3'] };
  if (type === 'rating') return { ...base, label: 'Overall rating', scaleMax: 5 };
  if (type === 'number') return { ...base, label: 'Number', min: 0, max: 100 };
  return { ...base, label: meta.label };
}

// --- Seed form --------------------------------------------------------------

const SEED_SECTIONS: FormSection[] = [
  {
    id: 's1',
    title: 'Project Overview',
    description: 'Basic information about the project being evaluated.',
    fields: [
      { id: 'f1', type: 'text', label: 'Project title', required: true, placeholder: 'e.g. Smart Attendance System' },
      { id: 'f2', type: 'dropdown', label: 'Project category', required: true, options: ['Research', 'Innovation', 'Service', 'Startup'] },
      { id: 'f3', type: 'textarea', label: 'Abstract', helpText: 'A short summary of the project (max 300 words).', required: false },
    ],
  },
  {
    id: 's2',
    title: 'Assessment Criteria',
    description: 'Rate each dimension of the project.',
    fields: [
      { id: 'f4', type: 'rating', label: 'Originality & innovation', required: true, scaleMax: 5 },
      { id: 'f5', type: 'rating', label: 'Technical execution', required: true, scaleMax: 5 },
      { id: 'f6', type: 'radio', label: 'Meets the objectives?', required: true, options: ['Fully', 'Partially', 'Not met'] },
    ],
  },
  {
    id: 's3',
    title: 'Attachments & Sign-off',
    fields: [
      { id: 'f7', type: 'file', label: 'Supporting document', helpText: 'PDF or slides, up to 20 MB.', required: false },
      { id: 'f8', type: 'signature', label: 'Evaluator signature', required: true },
    ],
  },
];

const CATEGORIES = ['Project Evaluation', 'Self-Assessment', 'Peer Review', 'Advisor Review', 'Survey'];

// --- Sortable field row -----------------------------------------------------

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
        aria-label="Drag to reorder"
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
            {field.label || 'Untitled field'}
          </Typography>
          {field.required && (
            <Typography component="span" sx={{ color: 'error.main', fontWeight: 700, lineHeight: 1 }}>
              *
            </Typography>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {meta.label}
          {meta.hasOptions && field.options ? ` · ${field.options.length} options` : ''}
        </Typography>
      </Box>

      <Stack direction="row" sx={{ flexShrink: 0 }}>
        <Tooltip title="Duplicate">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// --- Field preview (used in the Preview dialog) -----------------------------

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
      {field.label || 'Untitled field'}
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
          <MenuItem value="">Select…</MenuItem>
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
            <Typography variant="body2">Click to upload or drag a file here</Typography>
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
              <Typography variant="caption">Sign here</Typography>
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

// --- Palette ----------------------------------------------------------------

function Palette({ onAdd }: { onAdd: (type: FieldType) => void }) {
  return (
    <Card sx={{ position: { lg: 'sticky' }, top: { lg: 16 } }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <TuneIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Field types
          </Typography>
        </Stack>
        <Stack spacing={2}>
          {FIELD_GROUPS.map((group) => (
            <Box key={group}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {group}
              </Typography>
              <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                {(Object.keys(FIELD_TYPES) as FieldType[])
                  .filter((t) => FIELD_TYPES[t].group === group)
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

// --- Inspector --------------------------------------------------------------

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
        OPTIONS
      </Typography>
      {options.map((opt, i) => (
        <Stack key={i} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            fullWidth
            value={opt}
            onChange={(e) => onChange(options.map((o, idx) => (idx === i ? e.target.value : o)))}
          />
          <IconButton
            size="small"
            disabled={options.length <= 1}
            onClick={() => onChange(options.filter((_, idx) => idx !== i))}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...options, `Option ${options.length + 1}`])} sx={{ alignSelf: 'flex-start' }}>
        Add option
      </Button>
    </Stack>
  );
}

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
      <Card sx={{ position: { lg: 'sticky' }, top: { lg: 16 } }}>
        <CardContent>
          <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <SettingsIcon sx={{ fontSize: 40, opacity: 0.4 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              No field selected
            </Typography>
            <Typography variant="caption">
              Add a field from the palette or select one on the canvas to edit its properties.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const meta = FIELD_TYPES[field.type];

  return (
    <Card sx={{ position: { lg: 'sticky' }, top: { lg: 16 } }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <RuleIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Field properties
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip size="small" label={meta.label} sx={{ bgcolor: alpha(meta.color, 0.12), color: meta.color, fontWeight: 600 }} />
        </Stack>

        <Stack spacing={2}>
          <TextField label="Label" size="small" fullWidth value={field.label} onChange={(e) => onChange({ label: e.target.value })} />
          <TextField label="Help text" size="small" fullWidth value={field.helpText ?? ''} onChange={(e) => onChange({ helpText: e.target.value })} placeholder="Optional guidance shown under the field" />

          {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
            <TextField label="Placeholder" size="small" fullWidth value={field.placeholder ?? ''} onChange={(e) => onChange({ placeholder: e.target.value })} />
          )}

          {meta.hasOptions && (
            <OptionsEditor options={field.options ?? []} onChange={(options) => onChange({ options })} />
          )}

          {field.type === 'number' && (
            <Stack direction="row" spacing={1}>
              <TextField label="Min" size="small" type="number" fullWidth value={field.min ?? ''} onChange={(e) => onChange({ min: e.target.value === '' ? undefined : Number(e.target.value) })} />
              <TextField label="Max" size="small" type="number" fullWidth value={field.max ?? ''} onChange={(e) => onChange({ max: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </Stack>
          )}

          {field.type === 'rating' && (
            <TextField select label="Scale" size="small" fullWidth value={field.scaleMax ?? 5} onChange={(e) => onChange({ scaleMax: Number(e.target.value) })}>
              <MenuItem value={3}>1 – 3</MenuItem>
              <MenuItem value={5}>1 – 5</MenuItem>
              <MenuItem value={10}>1 – 10</MenuItem>
            </TextField>
          )}

          <Divider />

          <FormControlLabel
            control={<Switch checked={field.required} onChange={(e) => onChange({ required: e.target.checked })} />}
            label={<Typography variant="body2">Required field</Typography>}
          />

          <TextField select label="Section" size="small" fullWidth value={sectionId ?? ''} onChange={(e) => onMoveSection(e.target.value)}>
            {sections.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- Page -------------------------------------------------------------------

export default function FormBuilderPage() {
  const theme = useTheme();
  const [formName, setFormName] = React.useState('Project Evaluation Form');
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [version, setVersion] = React.useState(3);
  const [published, setPublished] = React.useState(false);
  const [sections, setSections] = React.useState<FormSection[]>(SEED_SECTIONS);
  const [activeSectionId, setActiveSectionId] = React.useState<string>(SEED_SECTIONS[0].id);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

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

  // --- Mutations ---
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
    const s: FormSection = { id: uid('s'), title: `Section ${sections.length + 1}`, fields: [] };
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
        title="Form Builder"
        description="Design dynamic evaluation forms with drag-and-drop fields, sections, and validation."
        actions={
          <>
            <Button variant="outlined" color="inherit" startIcon={<VisibilityIcon />} onClick={() => setPreviewOpen(true)}>
              Preview
            </Button>
            <Button variant="outlined" startIcon={<SaveIcon />}>
              Save draft
            </Button>
            <Button variant="contained" startIcon={<PublishIcon />} onClick={publish}>
              Publish
            </Button>
          </>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Sections" value={stats.sections} icon={ViewAgendaIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Fields" value={stats.fields} icon={LayersIcon} color={ACCENT.blue} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Required" value={stats.required} icon={RuleIcon} color={ACCENT.amber} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="Version"
            value={`v${version}`}
            icon={AssignmentIcon}
            color={published ? ACCENT.green : ACCENT.cyan}
            hint={published ? 'Published' : 'Draft'}
          />
        </Grid>
      </Grid>

      {/* Form meta bar */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <TextField
              label="Form name"
              size="small"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <TextField select label="Category" size="small" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 220 }}>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <Chip
              label={published ? 'Published' : 'Draft'}
              color={published ? 'success' : 'default'}
              variant={published ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Workspace: palette · canvas · inspector */}
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
                    sx={{
                      borderColor: isActive ? 'primary.main' : 'divider',
                      transition: 'border-color .15s',
                    }}
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
                        <Chip size="small" label={`${section.fields.length} fields`} variant="outlined" />
                        <Tooltip title="Delete section">
                          <span>
                            <IconButton
                              size="small"
                              disabled={sections.length <= 1}
                              onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
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
                                {isActive ? 'Click a field type on the left to add it here.' : 'Empty — select this section, then add a field.'}
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
                color="inherit"
                startIcon={<AddIcon />}
                onClick={addSection}
                sx={{ borderStyle: 'dashed', py: 1.25 }}
              >
                Add section
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

      {/* Preview dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }}>
              <VisibilityIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                {formName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {category} · Preview · v{version}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {sections.map((section) => (
              <Box key={section.id}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {section.title}
                </Typography>
                {section.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {section.description}
                  </Typography>
                )}
                <Stack spacing={2.5} sx={{ mt: 1.5 }}>
                  {section.fields.length === 0 ? (
                    <Typography variant="body2" color="text.disabled">No fields in this section.</Typography>
                  ) : (
                    section.fields.map((field) => <FieldPreview key={field.id} field={field} />)
                  )}
                </Stack>
                <Divider sx={{ mt: 3 }} />
              </Box>
            ))}
            <Button variant="contained" size="large" disabled sx={{ alignSelf: 'flex-start' }}>
              Submit evaluation
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

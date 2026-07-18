'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import CategoryIcon from '@mui/icons-material/Category';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PageHeader from '@/components/common/PageHeader';
import KpiCard from '@/components/common/KpiCard';
import FilterBar from '@/components/common/FilterBar';
import Button from '@/components/common/Button';
import Chip from '@/components/common/Chip';
import { ACCENT } from '@/theme/accents';
import { softCard, softCardHover } from '@/theme/surfaces';

// --- โครงข้อมูล -------------------------------------------------------------

type Visibility = 'public' | 'private';

interface TemplateVersion {
  version: string;
  date: string;
  note: string;
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  visibility: Visibility;
  version: string;
  sections: number;
  fields: number;
  usage: number;
  rating: number;
  author: string;
  updated: string; // ISO
  history: TemplateVersion[];
}

const CATEGORY_META: Record<string, { color: string; icon: typeof DescriptionIcon }> = {
  'ประเมินโปรเจกต์': { color: ACCENT.violet, icon: AssignmentTurnedInIcon },
  'ประเมินตนเอง': { color: ACCENT.blue, icon: PersonIcon },
  'เพื่อนประเมิน': { color: ACCENT.cyan, icon: LayersIcon },
  'ที่ปรึกษาประเมิน': { color: ACCENT.green, icon: StarIcon },
  'แบบสำรวจ': { color: ACCENT.amber, icon: DescriptionIcon },
};

const CATEGORIES = Object.keys(CATEGORY_META);

const dateFmt = new Intl.DateTimeFormat('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' });

// --- ข้อมูลตัวอย่าง (วันนี้ = 2026-07-18) ----------------------------------

const SEED: FormTemplate[] = [
  {
    id: 't1',
    name: 'แบบประเมินโปรเจกต์จบ',
    description: 'แบบฟอร์มอิงเกณฑ์แบบครบถ้วน สำหรับการสอบป้องกันโปรเจกต์จบของนักศึกษาปีสุดท้าย',
    category: 'ประเมินโปรเจกต์',
    tags: ['โปรเจกต์จบ', 'วิศวกรรม', 'สอบป้องกัน'],
    visibility: 'public',
    version: '2.4',
    sections: 4,
    fields: 18,
    usage: 132,
    rating: 4.8,
    author: 'อนงค์ วัฒนา',
    updated: '2026-07-09',
    history: [
      { version: '2.4', date: '2026-07-09', note: 'เพิ่มส่วนถ่วงน้ำหนักด้านนวัตกรรม' },
      { version: '2.3', date: '2026-05-20', note: 'ปรับเกณฑ์การนำเสนอให้ชัดขึ้น' },
      { version: '2.0', date: '2026-02-11', note: 'ปรับโครงสร้างใหญ่เป็น 4 ส่วน' },
    ],
  },
  {
    id: 't2',
    name: 'แบบประเมินการมีส่วนร่วมของเพื่อน',
    description: 'แบบฟอร์มสั้นกระชับให้นักศึกษาประเมินการมีส่วนร่วมและการทำงานร่วมกันของเพื่อนในทีม',
    category: 'เพื่อนประเมิน',
    tags: ['ทีมเวิร์ก', 'นักศึกษา'],
    visibility: 'public',
    version: '1.6',
    sections: 2,
    fields: 9,
    usage: 210,
    rating: 4.5,
    author: 'รุ่งโรจน์ ประเสริฐ',
    updated: '2026-06-28',
    history: [
      { version: '1.6', date: '2026-06-28', note: 'เพิ่มหมายเหตุตัวเลือกไม่ระบุชื่อ' },
      { version: '1.4', date: '2026-04-02', note: 'ย่อเหลือ 9 ช่อง' },
    ],
  },
  {
    id: 't3',
    name: 'แบบประเมินตนเอง (สะท้อนคิด)',
    description: 'แบบฟอร์มสะท้อนคิดแบบมีคำชี้แนะ ครอบคลุมเป้าหมาย ผลการเรียนรู้ และก้าวต่อไป',
    category: 'ประเมินตนเอง',
    tags: ['สะท้อนคิด', 'พัฒนาการ'],
    visibility: 'private',
    version: '1.2',
    sections: 3,
    fields: 11,
    usage: 47,
    rating: 4.2,
    author: 'สุดา มีสุข',
    updated: '2026-07-01',
    history: [
      { version: '1.2', date: '2026-07-01', note: 'เพิ่มตารางผลการเรียนรู้' },
      { version: '1.0', date: '2026-03-15', note: 'เวอร์ชันแรก' },
    ],
  },
  {
    id: 't4',
    name: 'แบบอนุมัติขั้นสุดท้ายโดยที่ปรึกษา',
    description: 'แบบฟอร์มอนุมัติของที่ปรึกษา พร้อมการให้คะแนนถ่วงน้ำหนักและช่องลงลายมือชื่อ',
    category: 'ที่ปรึกษาประเมิน',
    tags: ['ที่ปรึกษา', 'ลายมือชื่อ', 'อนุมัติ'],
    visibility: 'public',
    version: '3.0',
    sections: 3,
    fields: 14,
    usage: 88,
    rating: 4.9,
    author: 'กิตติเศรษฐ์ เลาหง',
    updated: '2026-07-12',
    history: [
      { version: '3.0', date: '2026-07-12', note: 'ปรับสูตรการให้คะแนนใหม่' },
      { version: '2.1', date: '2026-05-05', note: 'เพิ่มช่องลายมือชื่อดิจิทัล' },
    ],
  },
  {
    id: 't5',
    name: 'แบบสำรวจความพึงพอใจรายวิชา',
    description: 'แบบสำรวจปลายภาคเพื่อวัดคุณภาพรายวิชาและประสิทธิภาพของผู้สอน',
    category: 'แบบสำรวจ',
    tags: ['สำรวจ', 'ความเห็น', 'รายวิชา'],
    visibility: 'public',
    version: '1.9',
    sections: 2,
    fields: 12,
    usage: 356,
    rating: 4.3,
    author: 'ประสิทธิ์ ทองดี',
    updated: '2026-06-15',
    history: [
      { version: '1.9', date: '2026-06-15', note: 'เพิ่มคำถาม NPS' },
      { version: '1.5', date: '2026-01-30', note: 'เขียนป้ายสเกล Likert ใหม่' },
    ],
  },
  {
    id: 't6',
    name: 'แบบให้คะแนนพิตช์นวัตกรรม',
    description: 'แบบให้คะแนนแบบรวดเร็ว สำหรับการแข่งขันพิตช์นวัตกรรมและสตาร์ทอัพ',
    category: 'ประเมินโปรเจกต์',
    tags: ['พิตช์', 'สตาร์ทอัพ', 'นวัตกรรม'],
    visibility: 'private',
    version: '1.1',
    sections: 2,
    fields: 8,
    usage: 24,
    rating: 4.0,
    author: 'อนงค์ วัฒนา',
    updated: '2026-07-14',
    history: [
      { version: '1.1', date: '2026-07-14', note: 'ปรับน้ำหนักด้านความเหมาะสมกับตลาด' },
      { version: '1.0', date: '2026-06-30', note: 'เวอร์ชันแรก' },
    ],
  },
  {
    id: 't7',
    name: 'แบบประเมินความก้าวหน้าโครงงาน (Oral) — รายวงรอบ',
    description: 'แบบประเมินการนำเสนอความก้าวหน้าโครงงานซอฟต์แวร์ 8 หัวข้อ ให้คะแนน 5 ระดับ โดยอาจารย์ 3 ท่านแบ่งหัวข้อกันประเมิน (ไม่ทับกัน) ครอบคลุม 4 วงรอบ รอบละ 2 เดือน',
    category: 'ที่ปรึกษาประเมิน',
    tags: ['Oral', 'โครงงาน', 'รายวงรอบ', '8 หัวข้อ'],
    visibility: 'public',
    version: '1.0',
    sections: 8,
    fields: 17,
    usage: 12,
    rating: 4.7,
    author: 'อนงค์ วัฒนา',
    updated: '2027-01-05',
    history: [
      { version: '1.0', date: '2027-01-05', note: 'สร้างจากแบบประเมิน Oral ของทีม T5 (TTT Brother)' },
    ],
  },
];

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

// --- การ์ดเทมเพลต -----------------------------------------------------------

function TemplateCard({
  tpl,
  onPreview,
  onUse,
  onMenu,
}: {
  tpl: FormTemplate;
  onPreview: () => void;
  onUse: () => void;
  onMenu: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const meta = CATEGORY_META[tpl.category];
  const Icon = meta.icon;

  return (
    <Card sx={[softCardHover, { height: '100%', display: 'flex', flexDirection: 'column' }]}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(meta.color, 0.14), color: meta.color, width: 46, height: 46, borderRadius: 2 }}>
            <Icon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {tpl.name}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip label={tpl.category} color={meta.color} variant="soft" size="sm" />
              <Chip
                icon={tpl.visibility === 'public' ? PublicIcon : LockIcon}
                label={tpl.visibility === 'public' ? 'สาธารณะ' : 'ส่วนตัว'}
                color={tpl.visibility === 'public' ? ACCENT.green : ACCENT.amber}
                variant="outlined"
                size="sm"
              />
            </Stack>
          </Box>
          <Button variant="ghost" color={meta.color} iconOnly size="sm" onClick={onMenu}>
            <MoreVertIcon fontSize="small" />
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tpl.description}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {tpl.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} color={ACCENT.violet} variant="outlined" size="sm" />
          ))}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', mb: 1.5 }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <LayersIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{tpl.fields} ช่อง</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">ใช้ {tpl.usage} ครั้ง</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <StarIcon sx={{ fontSize: 16, color: ACCENT.amber }} />
            <Typography variant="caption">{tpl.rating.toFixed(1)}</Typography>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1.5 }} />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: alpha(meta.color, 0.14), color: meta.color }}>
            {initials(tpl.author)}
          </Avatar>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flexGrow: 1 }}>
            {tpl.author}
          </Typography>
          <Chip label={`v${tpl.version}`} color={ACCENT.cyan} variant="outlined" size="sm" />
          <Typography variant="caption" color="text.secondary">
            {dateFmt.format(new Date(tpl.updated))}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="outlined" color={meta.color} startIcon={VisibilityIcon} onClick={onPreview}>
            ดูตัวอย่าง
          </Button>
          <Button fullWidth variant="solid" color={meta.color} startIcon={ContentCopyIcon} onClick={onUse}>
            ใช้งาน
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- หน้าเพจ -----------------------------------------------------------------

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'ทุกหมวดหมู่' },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];
const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'public', label: 'สาธารณะ' },
  { value: 'private', label: 'ส่วนตัว' },
];
const SORT_OPTIONS = [
  { value: 'popular', label: 'ใช้มากที่สุด' },
  { value: 'recent', label: 'อัปเดตล่าสุด' },
  { value: 'rating', label: 'คะแนนสูงสุด' },
];

export default function TemplateLibraryPage() {
  const router = useRouter();
  const [templates] = React.useState<FormTemplate[]>(SEED);

  /** เปิดเทมเพลตในเครื่องมือสร้างแบบฟอร์ม (โหลดโครงช่องของเทมเพลตนั้น) */
  const openInBuilder = (tpl: FormTemplate) => router.push(`/forms/builder?template=${tpl.id}`);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [visibility, setVisibility] = React.useState('all');
  const [sort, setSort] = React.useState<'popular' | 'recent' | 'rating'>('popular');

  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = React.useState<FormTemplate | null>(null);
  const [preview, setPreview] = React.useState<FormTemplate | null>(null);
  const [history, setHistory] = React.useState<FormTemplate | null>(null);
  const [useTarget, setUseTarget] = React.useState<FormTemplate | null>(null);

  const summary = React.useMemo(
    () => ({
      total: templates.length,
      publicCount: templates.filter((t) => t.visibility === 'public').length,
      privateCount: templates.filter((t) => t.visibility === 'private').length,
      categories: new Set(templates.map((t) => t.category)).size,
    }),
    [templates],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = templates.filter(
      (t) =>
        (category === 'all' || t.category === category) &&
        (visibility === 'all' || t.visibility === visibility) &&
        (q === '' ||
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))),
    );
    const sorted = [...rows];
    if (sort === 'popular') sorted.sort((a, b) => b.usage - a.usage);
    if (sort === 'recent') sorted.sort((a, b) => +new Date(b.updated) - +new Date(a.updated));
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [templates, search, category, visibility, sort]);

  const filtersActive = category !== 'all' || visibility !== 'all' || search.trim() !== '';
  const resetFilters = () => {
    setCategory('all');
    setVisibility('all');
    setSearch('');
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, row: FormTemplate) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="คลังเทมเพลต"
        description="เรียกดู ดูตัวอย่าง และนำเทมเพลตแบบฟอร์มที่บันทึกไว้กลับมาใช้ทั่วทั้งองค์กร"
        actions={
          <>
            <Button variant="outlined" color={ACCENT.violet} startIcon={UploadFileIcon}>
              นำเข้า
            </Button>
            <Button variant="solid" color={ACCENT.violet} startIcon={AddIcon}>
              เทมเพลตใหม่
            </Button>
          </>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="เทมเพลตทั้งหมด" value={summary.total} icon={LibraryBooksIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="สาธารณะ" value={summary.publicCount} icon={PublicIcon} color={ACCENT.green} caption="แชร์ทั้งองค์กร" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="ส่วนตัว" value={summary.privateCount} icon={LockIcon} color={ACCENT.amber} caption="เฉพาะหน่วยงานคุณ" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="หมวดหมู่" value={summary.categories} icon={CategoryIcon} color={ACCENT.blue} />
        </Grid>
      </Grid>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'ค้นหาชื่อ, แท็ก…' }}
        filters={[
          { key: 'category', label: 'หมวดหมู่', value: category, onChange: setCategory, options: CATEGORY_OPTIONS, minWidth: 190 },
          { key: 'visibility', label: 'การมองเห็น', value: visibility, onChange: setVisibility, options: VISIBILITY_OPTIONS },
          { key: 'sort', label: 'เรียงตาม', value: sort, onChange: (v) => setSort(v as typeof sort), options: SORT_OPTIONS },
        ]}
        onReset={resetFilters}
        active={filtersActive}
      />

      {filtered.length === 0 ? (
        <Card sx={softCard}>
          <CardContent>
            <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
              <LibraryBooksIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6">ไม่พบเทมเพลตที่ตรงกับตัวกรอง</Typography>
              <Typography variant="body2" color="text.secondary">
                ลองเปลี่ยนหมวดหมู่ การมองเห็น หรือคำค้นหา
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((tpl) => (
            <Grid key={tpl.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <TemplateCard
                tpl={tpl}
                onPreview={() => setPreview(tpl)}
                onUse={() => setUseTarget(tpl)}
                onMenu={(e) => openMenu(e, tpl)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* เมนูของแถว */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => { if (menuRow) setUseTarget(menuRow); closeMenu(); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>ทำสำเนาเป็นแบบฟอร์มใหม่</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (menuRow) setHistory(menuRow); closeMenu(); }}>
          <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
          <ListItemText>ประวัติเวอร์ชัน</ListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <ListItemIcon><FileDownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>ส่งออก JSON</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={closeMenu} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>ลบ</ListItemText>
        </MenuItem>
      </Menu>

      {/* กล่องดูตัวอย่าง */}
      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="sm">
        {preview && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar variant="rounded" sx={{ bgcolor: alpha(CATEGORY_META[preview.category].color, 0.14), color: CATEGORY_META[preview.category].color, borderRadius: 2 }}>
                  {React.createElement(CATEGORY_META[preview.category].icon)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{preview.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{preview.category} · v{preview.version}</Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {preview.description}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                {[
                  { label: 'ส่วน', value: preview.sections, icon: LayersIcon },
                  { label: 'ช่อง', value: preview.fields, icon: DescriptionIcon },
                  { label: 'ใช้ไปแล้ว', value: preview.usage, icon: AssignmentTurnedInIcon },
                  { label: 'คะแนน', value: preview.rating.toFixed(1), icon: StarIcon },
                ].map((s) => (
                  <Grid key={s.label} size={6}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <s.icon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{s.value}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                {preview.tags.map((tag) => (
                  <Chip key={tag} label={`#${tag}`} color={ACCENT.violet} variant="outlined" size="sm" />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 2, color: 'text.secondary' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="caption">สร้างโดย {preview.author}</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <ScheduleIcon fontSize="small" />
                <Typography variant="caption">อัปเดต {dateFmt.format(new Date(preview.updated))}</Typography>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button variant="ghost" color={ACCENT.violet} onClick={() => setPreview(null)}>ปิด</Button>
              <Button variant="solid" color={ACCENT.violet} startIcon={ContentCopyIcon} onClick={() => { setUseTarget(preview); setPreview(null); }}>
                ใช้เทมเพลตนี้
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* กล่องประวัติเวอร์ชัน */}
      <Dialog open={Boolean(history)} onClose={() => setHistory(null)} fullWidth maxWidth="xs">
        {history && (
          <>
            <DialogTitle>ประวัติเวอร์ชัน — {history.name}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                {history.history.map((h, i) => (
                  <Stack key={h.version} direction="row" spacing={1.5}>
                    <Stack sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: i === 0 ? 'primary.main' : 'divider', mt: 0.5 }} />
                      {i < history.history.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
                    </Stack>
                    <Box sx={{ pb: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>v{h.version}</Typography>
                        {i === 0 && <Chip label="ปัจจุบัน" color={ACCENT.violet} variant="solid" size="sm" />}
                        <Typography variant="caption" color="text.secondary">{dateFmt.format(new Date(h.date))}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{h.note}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="ghost" color={ACCENT.violet} onClick={() => setHistory(null)}>ปิด</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ยืนยันการใช้ / ทำสำเนา */}
      <Dialog open={Boolean(useTarget)} onClose={() => setUseTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ใช้เทมเพลต</DialogTitle>
        <DialogContent>
          <DialogContentText>
            สร้างแบบฟอร์มใหม่จาก <strong>{useTarget?.name}</strong> หรือไม่? สำเนาของ {useTarget?.fields} ช่อง
            จะถูกเปิดในเครื่องมือสร้างแบบฟอร์มเพื่อแก้ไข
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" color={ACCENT.violet} onClick={() => setUseTarget(null)}>ยกเลิก</Button>
          <Button
            variant="solid"
            color={ACCENT.violet}
            startIcon={ContentCopyIcon}
            onClick={() => {
              if (useTarget) openInBuilder(useTarget);
              setUseTarget(null);
            }}
          >
            เปิดในเครื่องมือสร้างแบบฟอร์ม
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

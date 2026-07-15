'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
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
import StatTile from '@/components/common/StatTile';
import { ACCENT } from '@/theme/accents';

// --- Domain model -----------------------------------------------------------

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
  'Project Evaluation': { color: ACCENT.violet, icon: AssignmentTurnedInIcon },
  'Self-Assessment': { color: ACCENT.blue, icon: PersonIcon },
  'Peer Review': { color: ACCENT.cyan, icon: LayersIcon },
  'Advisor Review': { color: ACCENT.green, icon: StarIcon },
  Survey: { color: ACCENT.amber, icon: DescriptionIcon },
};

const CATEGORIES = Object.keys(CATEGORY_META);

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// --- Seed data (today = 2026-07-15) ----------------------------------------

const SEED: FormTemplate[] = [
  {
    id: 't1',
    name: 'Capstone Project Evaluation',
    description: 'Comprehensive rubric-based form for final-year capstone project defense.',
    category: 'Project Evaluation',
    tags: ['capstone', 'engineering', 'defense'],
    visibility: 'public',
    version: '2.4',
    sections: 4,
    fields: 18,
    usage: 132,
    rating: 4.8,
    author: 'Anong Wattana',
    updated: '2026-07-09',
    history: [
      { version: '2.4', date: '2026-07-09', note: 'Added innovation weighting section.' },
      { version: '2.3', date: '2026-05-20', note: 'Refined delivery criteria.' },
      { version: '2.0', date: '2026-02-11', note: 'Major restructure into 4 sections.' },
    ],
  },
  {
    id: 't2',
    name: 'Peer Contribution Review',
    description: 'Lightweight form for students to rate teammates’ contribution and collaboration.',
    category: 'Peer Review',
    tags: ['teamwork', 'students'],
    visibility: 'public',
    version: '1.6',
    sections: 2,
    fields: 9,
    usage: 210,
    rating: 4.5,
    author: 'Rungroj Prasert',
    updated: '2026-06-28',
    history: [
      { version: '1.6', date: '2026-06-28', note: 'Added anonymous option note.' },
      { version: '1.4', date: '2026-04-02', note: 'Shortened to 9 fields.' },
    ],
  },
  {
    id: 't3',
    name: 'Self-Assessment (Reflection)',
    description: 'Guided reflection form covering goals, learning outcomes and next steps.',
    category: 'Self-Assessment',
    tags: ['reflection', 'growth'],
    visibility: 'private',
    version: '1.2',
    sections: 3,
    fields: 11,
    usage: 47,
    rating: 4.2,
    author: 'Suda Meesuk',
    updated: '2026-07-01',
    history: [
      { version: '1.2', date: '2026-07-01', note: 'Added learning-outcome grid.' },
      { version: '1.0', date: '2026-03-15', note: 'Initial version.' },
    ],
  },
  {
    id: 't4',
    name: 'Advisor Final Sign-off',
    description: 'Advisor approval form with weighted scoring and signature block.',
    category: 'Advisor Review',
    tags: ['advisor', 'signature', 'approval'],
    visibility: 'public',
    version: '3.0',
    sections: 3,
    fields: 14,
    usage: 88,
    rating: 4.9,
    author: 'Kittset Laohong',
    updated: '2026-07-12',
    history: [
      { version: '3.0', date: '2026-07-12', note: 'Reworked scoring formula.' },
      { version: '2.1', date: '2026-05-05', note: 'Added digital signature field.' },
    ],
  },
  {
    id: 't5',
    name: 'Course Satisfaction Survey',
    description: 'End-of-term survey measuring course quality and instructor effectiveness.',
    category: 'Survey',
    tags: ['survey', 'feedback', 'course'],
    visibility: 'public',
    version: '1.9',
    sections: 2,
    fields: 12,
    usage: 356,
    rating: 4.3,
    author: 'Prasit Thongdee',
    updated: '2026-06-15',
    history: [
      { version: '1.9', date: '2026-06-15', note: 'Added NPS question.' },
      { version: '1.5', date: '2026-01-30', note: 'Rewrote Likert scale labels.' },
    ],
  },
  {
    id: 't6',
    name: 'Innovation Pitch Scoring',
    description: 'Fast scoring sheet for innovation and startup pitch competitions.',
    category: 'Project Evaluation',
    tags: ['pitch', 'startup', 'innovation'],
    visibility: 'private',
    version: '1.1',
    sections: 2,
    fields: 8,
    usage: 24,
    rating: 4.0,
    author: 'Anong Wattana',
    updated: '2026-07-14',
    history: [
      { version: '1.1', date: '2026-07-14', note: 'Tuned market-fit weighting.' },
      { version: '1.0', date: '2026-06-30', note: 'Initial version.' },
    ],
  },
];

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

// --- Template card ----------------------------------------------------------

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
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color .15s, box-shadow .15s',
        '&:hover': { borderColor: 'primary.main', boxShadow: (t) => `0 6px 20px ${alpha(t.palette.common.black, 0.06)}` },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(meta.color, 0.14), color: meta.color, width: 46, height: 46 }}>
            <Icon />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {tpl.name}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.25 }}>
              <Chip size="small" label={tpl.category} sx={{ height: 20, bgcolor: alpha(meta.color, 0.12), color: meta.color, fontWeight: 600 }} />
              <Chip
                size="small"
                icon={tpl.visibility === 'public' ? <PublicIcon sx={{ fontSize: 13 }} /> : <LockIcon sx={{ fontSize: 13 }} />}
                label={tpl.visibility === 'public' ? 'Public' : 'Private'}
                variant="outlined"
                sx={{ height: 20 }}
              />
            </Stack>
          </Box>
          <IconButton size="small" onClick={onMenu}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tpl.description}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {tpl.tags.map((tag) => (
            <Chip key={tag} size="small" label={`#${tag}`} variant="outlined" sx={{ height: 22, color: 'text.secondary' }} />
          ))}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', mb: 1.5 }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <LayersIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{tpl.fields} fields</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{tpl.usage} uses</Typography>
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
          <Chip size="small" label={`v${tpl.version}`} variant="outlined" sx={{ height: 20 }} />
          <Typography variant="caption" color="text.secondary">
            {dateFmt.format(new Date(tpl.updated))}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="outlined" color="inherit" size="small" startIcon={<VisibilityIcon />} onClick={onPreview}>
            Preview
          </Button>
          <Button fullWidth variant="contained" size="small" startIcon={<ContentCopyIcon />} onClick={onUse}>
            Use
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- Page -------------------------------------------------------------------

export default function TemplateLibraryPage() {
  const [templates] = React.useState<FormTemplate[]>(SEED);
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
        title="Template Library"
        description="Browse, preview and reuse saved form templates across the organization."
        actions={
          <>
            <Button variant="outlined" color="inherit" startIcon={<UploadFileIcon />}>
              Import
            </Button>
            <Button variant="contained" startIcon={<AddIcon />}>
              New template
            </Button>
          </>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Templates" value={summary.total} icon={LibraryBooksIcon} color={ACCENT.violet} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Public" value={summary.publicCount} icon={PublicIcon} color={ACCENT.green} hint="Shared org-wide" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Private" value={summary.privateCount} icon={LockIcon} color={ACCENT.amber} hint="Your unit only" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile label="Categories" value={summary.categories} icon={CategoryIcon} color={ACCENT.blue} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 190 }}>
              <MenuItem value="all">All categories</MenuItem>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </TextField>
            <TextField select size="small" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} sx={{ minWidth: 150 }}>
              <MenuItem value="popular">Most used</MenuItem>
              <MenuItem value="recent">Recently updated</MenuItem>
              <MenuItem value="rating">Top rated</MenuItem>
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <TextField
              size="small"
              placeholder="Search name, tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 260 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
              <LibraryBooksIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6">No templates match your filters</Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different category, visibility or search term.
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

      {/* Row menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => { if (menuRow) setUseTarget(menuRow); closeMenu(); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Clone to new form</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (menuRow) setHistory(menuRow); closeMenu(); }}>
          <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Version history</ListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <ListItemIcon><FileDownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export JSON</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={closeMenu} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Preview dialog */}
      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="sm">
        {preview && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar variant="rounded" sx={{ bgcolor: alpha(CATEGORY_META[preview.category].color, 0.14), color: CATEGORY_META[preview.category].color }}>
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
                  { label: 'Sections', value: preview.sections, icon: LayersIcon },
                  { label: 'Fields', value: preview.fields, icon: DescriptionIcon },
                  { label: 'Times used', value: preview.usage, icon: AssignmentTurnedInIcon },
                  { label: 'Rating', value: preview.rating.toFixed(1), icon: StarIcon },
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
                  <Chip key={tag} size="small" label={`#${tag}`} variant="outlined" />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 2, color: 'text.secondary' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="caption">Created by {preview.author}</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <ScheduleIcon fontSize="small" />
                <Typography variant="caption">Updated {dateFmt.format(new Date(preview.updated))}</Typography>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button color="inherit" onClick={() => setPreview(null)}>Close</Button>
              <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => { setUseTarget(preview); setPreview(null); }}>
                Use this template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Version history dialog */}
      <Dialog open={Boolean(history)} onClose={() => setHistory(null)} fullWidth maxWidth="xs">
        {history && (
          <>
            <DialogTitle>Version history — {history.name}</DialogTitle>
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
                        {i === 0 && <Chip size="small" label="Current" color="primary" sx={{ height: 18 }} />}
                        <Typography variant="caption" color="text.secondary">{dateFmt.format(new Date(h.date))}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{h.note}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setHistory(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Use / clone confirmation */}
      <Dialog open={Boolean(useTarget)} onClose={() => setUseTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Use template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a new form from <strong>{useTarget?.name}</strong>? A copy of its {useTarget?.fields} fields
            will open in the Form Builder for editing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setUseTarget(null)}>Cancel</Button>
          <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => setUseTarget(null)}>
            Create form
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

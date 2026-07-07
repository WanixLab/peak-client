'use client';

import * as React from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { alert } from '@/components/alert/AlertProvider';

/** A labelled group of demo buttons. */
function DemoGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>{children}</Box>
    </Stack>
  );
}

export default function AlertsPlaygroundPage() {
  const [lastResult, setLastResult] = React.useState<string>('—');

  const handleConfirm = async () => {
    const ok = await alert.confirm('Delete this user?', 'This action cannot be undone.', {
      confirmText: 'Delete',
      danger: true,
    });
    setLastResult(ok ? 'Confirmed ✅' : 'Cancelled ✋');
    if (ok) await alert.success('Deleted!', 'The user has been removed.');
  };

  const handleChained = async () => {
    await alert.info('Step 1 of 2', 'Click OK to continue to the next step.');
    await alert.success('All done!', 'You completed the flow.');
    setLastResult('Chained flow finished');
  };

  const handleCustom = async () => {
    const { isConfirmed } = await alert.fire({
      icon: 'warning',
      title: 'Unsaved changes',
      text: 'Do you want to save before leaving?',
      confirmText: 'Save',
      cancelText: 'Discard',
      showCancel: true,
    });
    setLastResult(isConfirmed ? 'Chose: Save' : 'Chose: Discard');
  };

  const handleBlocking = async () => {
    await alert.fire({
      icon: 'info',
      title: 'Read me first',
      text: 'This alert ignores backdrop clicks and Escape — you must press OK.',
      dismissible: false,
    });
    setLastResult('Acknowledged (blocking alert)');
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Alerts Playground
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A minimal, SweetAlert-style dialog built on shadcn/ui. Call{' '}
          <Box component="code" sx={{ fontFamily: 'monospace' }}>
            alert.success()
          </Box>
          ,{' '}
          <Box component="code" sx={{ fontFamily: 'monospace' }}>
            alert.confirm()
          </Box>{' '}
          from anywhere.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <DemoGroup title="Status alerts">
              <Button variant="contained" color="success" onClick={() => alert.success('Success!', 'Everything worked as expected.')}>
                Success
              </Button>
              <Button variant="contained" color="error" onClick={() => alert.error('Something went wrong', 'Please try again later.')}>
                Error
              </Button>
              <Button variant="contained" color="warning" onClick={() => alert.warning('Heads up', 'This might need your attention.')}>
                Warning
              </Button>
              <Button variant="contained" color="info" onClick={() => alert.info('Did you know?', 'This is an informational message.')}>
                Info
              </Button>
            </DemoGroup>

            <DemoGroup title="Confirm & flows">
              <Button variant="outlined" color="error" onClick={handleConfirm}>
                Confirm (danger)
              </Button>
              <Button variant="outlined" onClick={handleCustom}>
                Custom (Save / Discard)
              </Button>
              <Button variant="outlined" onClick={handleChained}>
                Chained alerts
              </Button>
              <Button variant="outlined" onClick={handleBlocking}>
                Non-dismissible
              </Button>
            </DemoGroup>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>
                Last result
              </Typography>
              <Chip label={lastResult} variant="outlined" />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

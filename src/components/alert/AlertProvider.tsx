'use client';

import * as React from 'react';
import { CircleCheck, CircleX, TriangleAlert, Info, CircleHelp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type AlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question';

export interface AlertOptions {
  /** Bold heading at the top of the dialog. */
  title?: React.ReactNode;
  /** Supporting line below the title. */
  text?: React.ReactNode;
  /** Which coloured status glyph to show (omit for none). */
  icon?: AlertIcon;
  /** Confirm button label. Default: "OK". */
  confirmText?: React.ReactNode;
  /** Cancel button label. Default: "Cancel". */
  cancelText?: React.ReactNode;
  /** Show the cancel button (turns the alert into a confirm dialog). */
  showCancel?: boolean;
  /** Style the confirm button as a destructive action. */
  danger?: boolean;
  /** Allow dismissing by clicking the backdrop / pressing Escape. Default: true. */
  dismissible?: boolean;
}

export interface AlertResult {
  /** True when the user pressed the confirm button. */
  isConfirmed: boolean;
  /** True when the user cancelled, closed, or clicked outside. */
  isDismissed: boolean;
}

type FireFn = (options: AlertOptions) => Promise<AlertResult>;

/* -------------------------------------------------------------------------- */
/*  Imperative singleton — call `alert.fire(...)` from anywhere               */
/* -------------------------------------------------------------------------- */

let dispatch: FireFn | null = null;

function fire(options: AlertOptions): Promise<AlertResult> {
  if (!dispatch) {
    return Promise.reject(
      new Error('<AlertProvider> is not mounted. Add it near the root of your app.'),
    );
  }
  return dispatch(options);
}

/**
 * SweetAlert-style helper. Usable anywhere (components, thunks, event handlers)
 * once `<AlertProvider>` is mounted once near the app root.
 *
 * @example
 * await alert.success('Saved!', 'Your changes have been stored.');
 * const { isConfirmed } = await alert.confirm('Delete user?', 'This cannot be undone.');
 */
export const alert = {
  fire,
  success: (title?: React.ReactNode, text?: React.ReactNode) =>
    fire({ icon: 'success', title, text }),
  error: (title?: React.ReactNode, text?: React.ReactNode) => fire({ icon: 'error', title, text }),
  warning: (title?: React.ReactNode, text?: React.ReactNode) =>
    fire({ icon: 'warning', title, text }),
  info: (title?: React.ReactNode, text?: React.ReactNode) => fire({ icon: 'info', title, text }),
  /** Confirm dialog — resolves to `true` only when confirmed. */
  confirm: async (title?: React.ReactNode, text?: React.ReactNode, options?: AlertOptions) => {
    const { isConfirmed } = await fire({
      icon: 'question',
      title,
      text,
      showCancel: true,
      ...options,
    });
    return isConfirmed;
  },
};

/* -------------------------------------------------------------------------- */
/*  Visuals                                                                    */
/* -------------------------------------------------------------------------- */

const ICONS: Record<AlertIcon, { Icon: typeof Info; className: string }> = {
  success: { Icon: CircleCheck, className: 'text-emerald-600 bg-emerald-500/10' },
  error: { Icon: CircleX, className: 'text-red-600 bg-red-500/10' },
  warning: { Icon: TriangleAlert, className: 'text-amber-500 bg-amber-500/10' },
  info: { Icon: Info, className: 'text-sky-600 bg-sky-500/10' },
  question: { Icon: CircleHelp, className: 'text-primary bg-primary/10' },
};

/** Solid confirm-button colour matching each status icon. */
const CONFIRM_COLORS: Record<AlertIcon, string> = {
  success: 'bg-emerald-600 text-white hover:bg-emerald-600/90 focus-visible:ring-emerald-600/30',
  error: 'bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-600/30',
  warning: 'bg-amber-500 text-white hover:bg-amber-500/90 focus-visible:ring-amber-500/30',
  info: 'bg-sky-600 text-white hover:bg-sky-600/90 focus-visible:ring-sky-600/30',
  question: '', // falls back to the default primary button
};

const DANGER_COLOR = 'bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-600/30';

function AlertGlyph({ icon, danger }: { icon: AlertIcon; danger?: boolean }) {
  const { Icon } = ICONS[icon];
  // A danger alert always uses the red (error) colour, whatever the icon shape.
  const className = danger ? ICONS.error.className : ICONS[icon].className;
  return (
    <div
      className={cn(
        'mx-auto flex size-14 items-center justify-center rounded-full',
        className,
      )}
    >
      <Icon className="size-7" strokeWidth={2} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

interface AlertState extends AlertOptions {
  open: boolean;
}

/**
 * Mounts a single reusable alert dialog and registers the imperative `alert`
 * API. Place it once, high in the tree (e.g. inside your root providers).
 */
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AlertState>({ open: false });
  const resolver = React.useRef<((result: AlertResult) => void) | null>(null);

  const settle = React.useCallback((result: AlertResult) => {
    setState((prev) => ({ ...prev, open: false }));
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  React.useEffect(() => {
    dispatch = (options) =>
      new Promise<AlertResult>((resolve) => {
        // If an alert is already open, resolve the previous one as dismissed.
        resolver.current?.({ isConfirmed: false, isDismissed: true });
        resolver.current = resolve;
        setState({ open: true, ...options });
      });
    return () => {
      dispatch = null;
    };
  }, []);

  const {
    open,
    title,
    text,
    icon,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    danger = false,
    dismissible = true,
  } = state;

  return (
    <>
      {children}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          // Controlled: ignoring the request keeps the dialog open. That's how
          // a non-dismissible alert blocks backdrop-click / Escape.
          if (next || !dismissible) return;
          settle({ isConfirmed: false, isDismissed: true });
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-xs text-center sm:max-w-sm">
          <DialogHeader className="items-center gap-3">
            {icon && <AlertGlyph icon={icon} danger={danger} />}
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {text ? (
              <DialogDescription className="text-center">{text}</DialogDescription>
            ) : (
              // Base UI associates a description for a11y; keep a hidden one.
              <DialogDescription className="sr-only">{title}</DialogDescription>
            )}
          </DialogHeader>

          <div className="mt-2 flex justify-center gap-2">
            {showCancel && (
              <Button
                variant="outline"
                className="min-w-24"
                onClick={() => settle({ isConfirmed: false, isDismissed: true })}
              >
                {cancelText}
              </Button>
            )}
            <Button
              variant="default"
              className={cn(
                'min-w-24',
                danger ? DANGER_COLOR : icon ? CONFIRM_COLORS[icon] : '',
              )}
              onClick={() => settle({ isConfirmed: true, isDismissed: false })}
            >
              {confirmText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

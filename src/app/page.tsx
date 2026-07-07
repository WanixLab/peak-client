import { redirect } from 'next/navigation';
import { appConfig } from '@/config';

/**
 * Landing route. The client-side guards handle auth, so we simply send users
 * to the login screen as the entry point of the template.
 */
export default function RootPage() {
  redirect(appConfig.routes.login);
}

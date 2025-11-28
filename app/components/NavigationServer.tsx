import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { Navigation } from './Navigation';

export default async function NavigationServer() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  return <Navigation role={role} />;
}

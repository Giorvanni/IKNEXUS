import React from 'react';
import DeployControls from '../DeployControls';
import DeployStatus from '../DeployStatus';
import DeployHistory from '../DeployHistory';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDeployPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'ADMIN')) {
    redirect('/login');
  }
  const hasStaging = !!process.env.VERCEL_DEPLOY_HOOK_STAGING;
  const hasProd = !!process.env.VERCEL_DEPLOY_HOOK_PROD;
  const prodUrl = process.env.NEXTAUTH_URL;
  return (
    <section className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Deployments</h1>
        <p className="subtle mt-2 text-sm">Trigger staging deploys and monitor readiness.
        </p>
      </div>
      <DeployControls hasStaging={hasStaging} hasProd={hasProd} prodUrl={prodUrl} />
      {prodUrl && (
        <div className="text-xs">
          Production readiness: <a className="text-brand-700 hover:underline" href={`${prodUrl}/api/ready`} target="_blank" rel="noreferrer">{prodUrl}/api/ready</a>
        </div>
      )}
      <DeployStatus />
      <DeployHistory />
      <div className="text-xs text-slate-500">
        Note: This triggers a Vercel Deploy Hook. Configure <code>VERCEL_DEPLOY_HOOK_STAGING</code> and/or <code>VERCEL_DEPLOY_HOOK_PROD</code> in environment variables to enable.
      </div>
    </section>
  );
}

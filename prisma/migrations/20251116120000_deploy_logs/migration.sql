-- CreateTable
CREATE TABLE "DeploymentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uid" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "readyState" TEXT,
    "target" TEXT,
    "deployedAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'vercel',
    "insertedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DeploymentLog_uid_key" ON "DeploymentLog"("uid");

-- CreateIndex
CREATE INDEX "DeploymentLog_deployedAt_idx" ON "DeploymentLog"("deployedAt");

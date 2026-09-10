import { appendFile, readFile, readdir } from 'node:fs/promises';
import { posix } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const { VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, GITHUB_SHA, GITHUB_REF_NAME } = process.env;
for (const name of ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID']) {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
}
if (VERCEL_ORG_ID !== 'team_NI6RY3w0UOIKwEyPPiGW6pbx') {
  throw new Error('Deployments must target the HsinCode team.');
}

async function api(path, body) {
  const url = new URL(path, 'https://api.vercel.com');
  url.searchParams.set('teamId', VERCEL_ORG_ID);
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Vercel API ${response.status}: ${result.error?.message ?? response.statusText}`);
  return result;
}

async function inlineFile(file) {
  return { file, data: (await readFile(file)).toString('base64'), encoding: 'base64' };
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = posix.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else if (entry.isFile()) files.push(await inlineFile(path));
    else throw new Error(`Unsupported deployment entry: ${path}`);
  }
  return files;
}

const project = await api(`/v9/projects/${VERCEL_PROJECT_ID}`);
if (project.accountId !== VERCEL_ORG_ID || project.name !== 'hsincode.com') {
  throw new Error('Unexpected deployment project.');
}
console.log('Verified HsinCode project:', project.name);

// Only public assets and Vercel configuration belong in the deployment.
const files = [...await collectFiles('public'), await inlineFile('vercel.json')];
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
let deployment = await api('/v13/deployments', {
  name: project.name,
  project: project.id,
  target: 'production',
  files,
  projectSettings: {
    framework: config.framework,
    buildCommand: config.buildCommand,
    installCommand: config.installCommand,
    outputDirectory: config.outputDirectory,
  },
  gitMetadata: {
    remoteUrl: 'https://github.com/hsincode/hsincode.com',
    commitSha: GITHUB_SHA,
    commitRef: GITHUB_REF_NAME ?? 'main',
    ci: true,
    ciType: 'github-actions',
  },
});
console.log(`Deployment created: ${deployment.id}`);

const deadline = Date.now() + 5 * 60_000;
while (deployment.readyState !== 'READY') {
  if (['ERROR', 'CANCELED'].includes(deployment.readyState)) {
    throw new Error(`Deployment ${deployment.readyState}: ${deployment.errorMessage ?? deployment.id}`);
  }
  if (Date.now() >= deadline) throw new Error(`Deployment timed out: ${deployment.id}`);
  await delay(3000);
  deployment = await api(`/v13/deployments/${deployment.id}`);
}
console.log(`Deployed to https://${deployment.url}`);
console.log('Production: https://hsincode.com/');
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `Deployed to [hsincode.com](https://hsincode.com/).\n\n[Deployment](https://${deployment.url})\n`);
}

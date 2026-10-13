import { spawnSync } from 'node:child_process';

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
  return result.status ?? 1;
}

function runApp(inputEnv = process.env) {
  const env = { ...inputEnv };
  delete env.ENVHUB_TOKEN;
  const pnpmCli = env.npm_execpath;
  if (!pnpmCli) throw new Error('pnpm executable path is unavailable');
  return run(process.execPath, [pnpmCli, 'run', 'build:app'], env);
}

if (process.env.VERCEL !== '1') {
  runApp();
} else {
  if (!process.env.ENVHUB_TOKEN) {
    throw new Error('ENVHUB_TOKEN must be set for Vercel builds');
  }

  const response = await fetch('https://env.tresnaid.space/v1/runtime/secrets', {
    headers: { Authorization: `Bearer ${process.env.ENVHUB_TOKEN}` },
  });
  if (!response.ok) throw new Error(`EnvHub fetch failed: HTTP ${response.status}`);

  const payload = await response.json();
  const apiUrl = payload?.secrets?.VITE_API_URL;
  if (typeof apiUrl !== 'string' || apiUrl.trim() === '') {
    throw new Error('EnvHub did not return VITE_API_URL');
  }

  runApp({ ...process.env, VITE_API_URL: apiUrl });
}

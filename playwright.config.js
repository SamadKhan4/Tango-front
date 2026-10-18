import { defineConfig, devices } from '@playwright/test';

const backendPort = 3011;
const frontendPort = 5174;
const backendUrl = `http://127.0.0.1:${backendPort}`;
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {}),
      },
    },
  ],
  webServer: [
    {
      command: 'npm.cmd start',
      cwd: '../Backend',
      url: `${backendUrl}/api/health`,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
      env: { ...process.env, HOST: '127.0.0.1', PORT: String(backendPort), MAX_PLAYERS: '6', MIN_PLAYERS: '2', CORS_ORIGINS: `http://127.0.0.1:${frontendPort}` },
    },
    {
      command: `npm.cmd run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      cwd: '.',
      url: `http://127.0.0.1:${frontendPort}`,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
      env: { ...process.env, VITE_API_URL: backendUrl, VITE_SOCKET_URL: backendUrl, VITE_MIN_PLAYERS: '2' },
    },
  ],
});

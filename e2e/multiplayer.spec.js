import { expect, test } from '@playwright/test';

async function createRoom(page, name) {
  await page.goto('/');
  await page.getByLabel('Display name').fill(name);
  await page.getByRole('button', { name: 'Create room' }).click();
  await expect(page.getByRole('heading', { name: 'Invite your players.' })).toBeVisible();
  return (await page.getByLabel('Room code').locator('output').textContent()).trim();
}

async function joinRoom(page, roomCode, name) {
  await page.goto('/');
  await page.getByLabel('Display name').fill(name);
  await page.getByLabel('Room code').fill(roomCode);
  await page.getByRole('button', { name: 'Join room' }).click();
  await expect(page.getByRole('heading', { name: 'Invite your players.' })).toBeVisible();
}

test('players receive private boards and take server-validated turns with public calls', async ({ browser }) => {
  const contexts = [];
  const newPage = async (options) => {
    const context = await browser.newContext(options);
    contexts.push(context);
    return context.newPage();
  };

  try {
    const host = await newPage();
    const roomCode = await createRoom(host, 'Host one');
    const players = await Promise.all(Array.from({ length: 5 }, async (_, index) => {
      const page = await newPage();
      await joinRoom(page, roomCode, 'Player ' + (index + 1));
      return page;
    }));

    await expect(host.getByLabel('Players')).toContainText('6/6');

    const seventh = await newPage();
    await seventh.goto('/');
    await seventh.getByLabel('Display name').fill('Seventh');
    await seventh.getByLabel('Room code').fill(roomCode);
    await seventh.getByRole('button', { name: 'Join room' }).click();
    await expect(seventh.getByRole('alert')).toContainText('ROOM FULL');

    await host.getByRole('button', { name: 'Start game' }).click();
    await Promise.all([host, ...players].map((page) => expect(page.getByRole('region', { name: 'Your private board' })).toBeVisible()));

    const hostBoard = await host.getByRole('region', { name: 'Your private board' }).innerText();
    const guestBoard = await players[0].getByRole('region', { name: 'Your private board' }).innerText();
    expect(hostBoard).not.toBe(guestBoard);

    await expect(host.getByRole('button', { name: 'Call number 1' })).toBeEnabled();
    await host.getByRole('button', { name: 'Call number 1' }).click();
    await Promise.all([host, ...players].map((page) => expect(page.getByText('1/25 called')).toBeVisible()));
    await expect(players[0].getByRole('button', { name: 'Call number 2' })).toBeEnabled();
    await expect(host.getByRole('button', { name: 'Call number 2' })).toBeDisabled();

    await players[0].getByRole('button', { name: 'Call number 2' }).click();
    await Promise.all([host, ...players].map((page) => expect(page.getByText('2/25 called')).toBeVisible()));
    await expect(host.getByRole('button', { name: 'Number 1 already called' })).toBeDisabled();

    await players[0].reload();
    await expect(players[0].getByRole('region', { name: 'Your private board' })).toBeVisible();
    await expect(players[0].getByText('2/25 called')).toBeVisible();

    const isolatedHost = await newPage();
    const isolatedCode = await createRoom(isolatedHost, 'Other host');
    const isolatedGuest = await newPage();
    await joinRoom(isolatedGuest, isolatedCode, 'Other guest');
    await isolatedHost.getByRole('button', { name: 'Start game' }).click();
    await isolatedHost.getByRole('button', { name: 'Call number 1' }).click();
    await expect(isolatedHost.getByText('1/25 called')).toBeVisible();
    await expect(host.getByText('2/25 called')).toBeVisible();

    const mobile = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await mobile.goto('/');
    await expect(mobile.getByRole('heading', { name: /A good game/i })).toBeVisible();
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});

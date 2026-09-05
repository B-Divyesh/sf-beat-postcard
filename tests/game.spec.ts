import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sample = [0, 2, 1, 2, 0, 3, 1, 2];

async function listen(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Hear pattern' }).click();
  await expect(page.getByRole('button', { name: 'Copy pattern' })).toBeEnabled({ timeout: 8_000 });
}

async function copyPattern(page: Page, notes: number[]): Promise<void> {
  await page.getByRole('button', { name: 'Copy pattern' }).click();
  for (let index = 0; index < 8; index += 1) {
    await page.locator(`.beat-${index + 1} .beat-marker.active`).waitFor({ timeout: 8_000 });
    await page.locator(`[data-pad="${notes[index]}"]`).click();
  }
}

async function copyPatternWithKeys(page: Page, notes: number[]): Promise<void> {
  await page.getByRole('button', { name: 'Copy pattern' }).click();
  const keys = ['d', 'f', 'j', 'k'];
  for (let index = 0; index < 8; index += 1) {
    await page.locator(`.beat-${index + 1} .beat-marker.active`).waitFor({ timeout: 8_000 });
    await page.keyboard.press(keys[notes[index]]);
  }
}

async function fillBar(page: Page, notes: number[]): Promise<void> {
  for (const note of notes) await page.locator(`[data-pad="${note}"]`).click();
}

async function closeContext(context: BrowserContext | undefined): Promise<void> {
  if (context) await context.close();
}

test('@claim:complete-exchange @claim:round-duration two fresh browsers exchange and finish a two-bar postcard', async ({ browser }) => {
  const started = Date.now();
  let creator: BrowserContext | undefined;
  let receiver: BrowserContext | undefined;
  let returnVisit: BrowserContext | undefined;
  try {
    creator = await browser.newContext();
    const creatorPage = await creator.newPage();
    await creatorPage.goto('/');
    await fillBar(creatorPage, [0, 1, 2, 3, 0, 2, 1, 3]);
    await creatorPage.getByRole('button', { name: 'Create share link' }).click();
    const callUrl = await creatorPage.locator('#share-link').inputValue();
    expect(callUrl).toMatch(/\/p\/v1-[a-z0-9]+-[0-3]{8}$/);

    receiver = await browser.newContext();
    const receiverPage = await receiver.newPage();
    await receiverPage.goto(callUrl);
    await expect(receiverPage.getByRole('heading', { name: 'Copy and extend this rhythm' })).toBeVisible();
    await listen(receiverPage);
    await copyPatternWithKeys(receiverPage, [0, 1, 2, 3, 0, 2, 1, 3]);
    await expect(receiverPage.locator('[data-end-state="win"]')).toBeVisible();
    await receiverPage.getByRole('button', { name: 'Add your reply bar' }).click();
    await fillBar(receiverPage, [3, 2, 1, 0, 3, 1, 2, 0]);
    await receiverPage.getByRole('button', { name: 'Finish reply' }).click();
    await expect(receiverPage.locator('[data-end-state="complete"]')).toBeVisible();
    const completedUrl = await receiverPage.locator('#share-link').inputValue();
    expect(completedUrl).toMatch(/\/p\/v1-[a-z0-9]+-[0-3]{8}-[0-3]{8}$/);

    returnVisit = await browser.newContext();
    const returnPage = await returnVisit.newPage();
    await returnPage.goto(completedUrl);
    await expect(returnPage.getByRole('heading', { name: 'The two-bar reply is complete' })).toBeVisible();
    await expect(returnPage.getByRole('list', { name: 'Rhythm sequence' })).toHaveCount(2);
    expect(Date.now() - started).toBeLessThan(45_000);
  } finally {
    await closeContext(returnVisit);
    await closeContext(receiver);
    await closeContext(creator);
  }
});

test('@claim:win-loss-endings a missed copy reaches a loss and retry clears the attempt', async ({ page }) => {
  await page.goto('/demo');
  await listen(page);
  const wrong = sample.map((note) => (note + 1) % 4);
  await copyPattern(page, wrong);
  await expect(page.locator('[data-end-state="loss"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Copy attempt did not pass' })).toBeVisible();
  await expect(page.getByText('0 sounds matched. Six matches complete the copy.')).toBeVisible();
  await page.getByRole('button', { name: 'Try the copy again' }).click();
  await expect(page.locator('[data-phase="ready"]')).toBeVisible();
  await expect(page.locator('.beat-marker.correct, .beat-marker.wrong')).toHaveCount(0);
});

test('@claim:restart-reset a completed round restarts at the unchanged call', async ({ page }) => {
  await page.goto('/p/v1-30-01230123-32103210');
  await expect(page.locator('[data-end-state="complete"]')).toBeVisible();
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator('[data-phase="ready"]')).toBeVisible();
  await expect(page.getByText('Round reset. Hear the call before you copy it.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The two-bar reply is complete' })).toHaveCount(0);
  await expect(page.locator('.beat-marker').first()).toHaveAttribute('aria-label', /Kick/);
});

test('@claim:demo-sandbox sample mode stays labelled, resets, and never changes real data', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('beat-postcard:real:draft', JSON.stringify({ tempo: 108, notes: [3] }));
    localStorage.setItem('beat-postcard:real:settings', JSON.stringify({ muted: false, wideTiming: true, reduceMotion: false, timingOffset: 25 }));
  });
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Reduce motion').check();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('definition').filter({ hasText: 'Sample from Mira' })).toBeVisible();
  const realBeforeLeaving = await page.evaluate(() => ({
    draft: localStorage.getItem('beat-postcard:real:draft'),
    settings: localStorage.getItem('beat-postcard:real:settings'),
  }));
  expect(realBeforeLeaving.draft).toContain('"notes":[3]');
  expect(realBeforeLeaving.settings).toContain('"wideTiming":true');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.locator('.beat-1 .beat-marker')).toHaveAttribute('aria-label', /Bell/);
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('beat-postcard:demo:')))).toEqual([]);
});

test('@claim:keyboard-controls keyboard input builds a shareable eight-beat call', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('d');
  await page.keyboard.press('f');
  await page.keyboard.press('j');
  await page.keyboard.press('k');
  await page.keyboard.press('d');
  await page.keyboard.press('j');
  await page.keyboard.press('f');
  await page.keyboard.press('k');
  await expect(page.getByRole('button', { name: 'Create share link' })).toBeEnabled();
  await page.getByRole('button', { name: 'Create share link' }).click();
  await expect(page.locator('#share-link')).toHaveValue(/-[0-3]{8}$/);
});

test('@claim:touch-controls a phone tap records the selected percussion sound', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const kick = page.getByRole('button', { name: 'Play Kick, key D' });
    await kick.scrollIntoViewIfNeeded();
    const box = await kick.boundingBox();
    expect(box).not.toBeNull();
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(page.locator('.beat-1 .beat-marker')).toHaveAttribute('aria-label', /Kick/);
  } finally {
    await context.close();
  }
});

test('@claim:audio-gesture @claim:synthesized-sounds sound starts only after a user enables it and fetches no audio', async ({ page }) => {
  const mediaRequests: string[] = [];
  page.on('request', (request) => { if (request.resourceType() === 'media') mediaRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.getByText('Sound waits for your first press.')).toBeVisible();
  await expect(page.locator('audio[autoplay], video[autoplay]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Enable sound' }).click();
  await expect(page.getByText('Sound ready.', { exact: true })).toBeVisible();
  await page.locator('[data-pad="0"]').click();
  expect(mediaRequests).toEqual([]);
});

test('@claim:invalid-recovery a damaged pattern link explains the problem and offers a new start', async ({ page }) => {
  await page.goto('/p/v1-too-short');
  await expect(page.getByRole('heading', { name: 'Open a complete rhythm link' })).toBeVisible();
  await expect(page.getByText('This link is missing a valid eight-beat pattern.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Make a new pattern' })).toHaveAttribute('href', '/');
});

test('@claim:timing-check four taps save a timing offset in under 20 seconds', async ({ page }) => {
  const started = Date.now();
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Start four-tap check' }).click();
  const tap = page.getByRole('button', { name: 'Tap with click' });
  for (let pulse = 1; pulse <= 4; pulse += 1) {
    await expect(tap).toHaveAttribute('data-pulse', String(pulse));
    await tap.click();
  }
  await expect(tap).toHaveAttribute('data-calibration-complete', 'true');
  await expect(page.locator('#calibration-status')).toContainText('Timing offset set to');
  expect(Date.now() - started).toBeLessThan(20_000);
  expect(await page.evaluate(() => localStorage.getItem('beat-postcard:real:settings'))).toContain('timingOffset');
});

test('@claim:settings-persist timing and motion settings survive a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Wide timing').check();
  await page.getByLabel('Reduce motion').check();
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Wide timing')).toBeChecked();
  await expect(page.getByLabel('Reduce motion')).toBeChecked();
  await expect(page.locator('body')).toHaveClass(/reduce-motion/);
});

test('@claim:draft-recovery an unfinished call returns after reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-pad="0"]').click();
  await page.locator('[data-pad="3"]').click();
  await page.reload();
  await expect(page.getByText('Draft restored. Add beat 3 or choose a beat to replace.')).toBeVisible();
  await expect(page.locator('.beat-1 .beat-marker')).toHaveAttribute('aria-label', /Kick/);
  await expect(page.locator('.beat-2 .beat-marker')).toHaveAttribute('aria-label', /Bell/);
});

test('@claim:local-privacy game play makes no cross-origin requests and creates no identity record', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/');
  await fillBar(page, [0, 1, 2, 3, 0, 1, 2, 3]);
  await page.getByRole('button', { name: 'Create share link' }).click();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  expect(await page.locator('input[type="email"], input[type="password"]').count()).toBe(0);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['beat-postcard:real:draft']);
  await expect(page.locator('#share-link')).toHaveValue(/\/p\/v1-/);
});

test('@claim:free-no-account the complete creator path has no sign-in or payment gate', async ({ page }) => {
  await page.goto('/');
  await fillBar(page, [0, 1, 2, 3, 0, 1, 2, 3]);
  await page.getByRole('button', { name: 'Create share link' }).click();
  await expect(page.locator('#share-link')).toBeVisible();
  await expect(page.getByText(/sign in|subscribe|checkout|payment/i)).toHaveCount(0);
});

test('@claim:sample-call the demo opens Mira’s complete eight-beat call at 104 BPM', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.rhythm-meta')).toContainText('104 BPM');
  await expect(page.locator('.rhythm-meta')).toContainText('Sample from Mira');
  const notes = await page.locator('.beat-ring .beat-marker').evaluateAll((beats) => beats.map((beat) => beat.getAttribute('aria-label')));
  expect(notes).toEqual([
    'Beat 1, Kick', 'Beat 2, Tick', 'Beat 3, Clap', 'Beat 4, Tick',
    'Beat 5, Kick', 'Beat 6, Bell', 'Beat 7, Clap', 'Beat 8, Tick',
  ]);
});

test('@claim:share-link-contents a created link contains the selected sounds and tempo only', async ({ page }) => {
  await page.goto('/');
  await fillBar(page, [0, 1, 2, 3, 0, 1, 2, 3]);
  await page.getByRole('button', { name: 'Create share link' }).click();
  const link = new URL(await page.locator('#share-link').inputValue());
  const parts = link.pathname.split('/').filter(Boolean);
  expect(parts).toHaveLength(2);
  expect(parts[0]).toBe('p');
  expect(parts[1]).toMatch(/^v1-[0-9a-z]+-01230123$/);
  expect(Number.parseInt(parts[1].split('-')[1], 36)).toBeGreaterThanOrEqual(96);
  expect(Number.parseInt(parts[1].split('-')[1], 36)).toBeLessThanOrEqual(116);
  expect(link.search).toBe('');
  expect(link.hash).toBe('');
  await page.goto(link.toString());
  await expect(page.getByRole('heading', { name: 'Copy and extend this rhythm' })).toBeVisible();
  await expect(page.locator('.beat-ring .beat-marker').nth(7)).toHaveAttribute('aria-label', 'Beat 8, Bell');
});

test('@claim:no-microphone a full sample copy never requests microphone access', async ({ page }) => {
  await page.addInitScript(() => {
    let requests = 0;
    const mediaDevices = (navigator as Navigator & { mediaDevices?: MediaDevices }).mediaDevices;
    if (mediaDevices) {
      Object.defineProperty(mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => {
          requests += 1;
          return Promise.reject(new DOMException('Microphone access is not available.', 'NotAllowedError'));
        },
      });
    }
    Object.defineProperty(window, '__beatPostcardMicrophoneRequests', {
      configurable: true,
      get: () => requests,
    });
  });
  await page.goto('/demo');
  await listen(page);
  await copyPatternWithKeys(page, sample);
  await expect(page.locator('[data-end-state="win"]')).toBeVisible();
  const requests = await page.evaluate(() => (window as typeof window & { __beatPostcardMicrophoneRequests: number }).__beatPostcardMicrophoneRequests);
  expect(requests).toBe(0);
});

test('@claim:no-tracking a completed sample exchange loads no third-party ads, analytics, or tracking pixels', async ({ page }) => {
  const requestOrigins = new Set<string>();
  page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await listen(page);
  await copyPatternWithKeys(page, sample);
  await page.getByRole('button', { name: 'Add your reply bar' }).click();
  await fillBar(page, [3, 2, 1, 0, 3, 2, 1, 0]);
  await page.getByRole('button', { name: 'Finish reply' }).click();
  await expect(page.locator('[data-end-state="complete"]')).toBeVisible();
  expect([...requestOrigins]).toEqual(['http://127.0.0.1:4173']);
  expect(page.frames().filter((frame) => frame.url().startsWith('http'))).toHaveLength(1);
});

test('@claim:product-boundaries a completed sample exchange keeps no upload, ranking, profile, or rhythm-record data', async ({ page }) => {
  await page.goto('/demo');
  await listen(page);
  await copyPatternWithKeys(page, sample);
  await page.getByRole('button', { name: 'Add your reply bar' }).click();
  await fillBar(page, [3, 2, 1, 0, 3, 2, 1, 0]);
  await page.getByRole('button', { name: 'Finish reply' }).click();
  await expect(page.locator('[data-end-state="complete"]')).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  const stored = await page.evaluate(() => Object.entries(localStorage));
  expect(stored).toEqual([['beat-postcard:demo:session', 'complete']]);
  const visibleControls = await page.locator('main button, main a, main input').evaluateAll((elements) => elements
    .filter((element) => getComputedStyle(element).display !== 'none')
    .map((element) => `${element.tagName}:${(element.textContent ?? '').trim()}:${element.getAttribute('aria-label') ?? ''}`)
    .join(' '));
  expect(visibleControls).not.toMatch(/upload|rank|leaderboard|profile/i);
});

test('@claim:render-rate the phone profile keeps at least 55 rendered frames per second', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto('/demo');
    await page.waitForFunction(() => Number(document.documentElement.dataset.fps) > 0);
    const fps = Number(await page.locator('html').getAttribute('data-fps'));
    expect(fps).toBeGreaterThanOrEqual(55);
  } finally {
    await context.close();
  }
});

test('@a11y core routes have no serious accessibility violations', async ({ page }) => {
  const routes = new Map([
    ['/', 'Beat Postcard — Copy and extend a rhythm'],
    ['/demo', 'Demo — Beat Postcard'],
    ['/privacy', 'Privacy — Beat Postcard'],
    ['/terms', 'Terms — Beat Postcard'],
    ['/p/not-a-pattern', 'Copy this rhythm — Beat Postcard'],
    ['/404.html', 'Page not found — Beat Postcard'],
  ]);
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));
  for (const [route, title] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    if (route === '/404.html') await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
    expect(serious, `${route}: ${serious.map((violation) => `${violation.id}: ${violation.help}`).join(', ')}`).toEqual([]);
  }
  expect(consoleErrors).toEqual([]);
});

test('@a11y keyboard focus, route titles, invalid links, and reduced motion work', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to game' })).toBeFocused();
  await page.getByLabel('Primary navigation').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveTitle('Privacy — Beat Postcard');
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveTitle('Beat Postcard — Copy and extend a rhythm');
  await page.goto('/p/%25broken');
  await expect(page.getByRole('heading', { name: 'Open a complete rhythm link' })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.locator('button').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
  expect(consoleErrors).toEqual([]);
});

test('@a11y mobile layout has touch targets and no horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const layout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(layout.scrollWidth).toBe(layout.clientWidth);
    const smallTargets = await page.locator('button:visible, a:visible').evaluateAll((elements) => elements
      .map((element) => ({ name: (element.textContent ?? '').trim(), rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width < 44 || rect.height < 44));
    expect(smallTargets).toEqual([]);
  } finally {
    await context.close();
  }
});

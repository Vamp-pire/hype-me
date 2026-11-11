// Tiny dependency-free browser driver: launches the Chrome or Edge already installed
// (headless, throwaway profile) and talks to it over the DevTools protocol.
// Used by monkey.mjs (bug finding) and snap.mjs (UX screenshots and scripted play).
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = {
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'],
};

export const VIEWPORTS = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
  desktop: { width: 1366, height: 850, deviceScaleFactor: 1, mobile: false },
};

export function findBrowser() {
  if (process.env.HYPE_ME_BROWSER && existsSync(process.env.HYPE_ME_BROWSER)) return process.env.HYPE_ME_BROWSER;
  return (CANDIDATES[process.platform] || []).find((p) => p && existsSync(p)) || null;
}

/** Launch a headless browser. Returns { port, close() }. */
export async function launch() {
  if (typeof WebSocket === 'undefined')
    throw new Error(`This needs Node.js 22 or newer (you have ${process.version}). Update Node from https://nodejs.org and try again.`);
  const exe = findBrowser();
  if (!exe) throw new Error('No Chrome or Edge found. Install one, or set HYPE_ME_BROWSER to its path.');
  const profile = mkdtempSync(join(tmpdir(), 'hype-me-browser-'));
  const child = spawn(
    exe,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--mute-audio',
      // Several tabs play at once: keep background tabs running at full speed.
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const portFile = join(profile, 'DevToolsActivePort');
  const started = Date.now();
  while (!existsSync(portFile) || !readFileSync(portFile, 'utf8').includes('\n')) {
    if (Date.now() - started > 20000) {
      child.kill();
      throw new Error('Browser did not start in 20s');
    }
    await sleep(100);
  }
  const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
  return {
    port,
    exe,
    async close() {
      child.kill();
      await sleep(300);
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {
        /* the OS may still hold a file for a moment */
      }
    },
  };
}

/** Open a new tab and return a page client. */
export async function newPage(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, bad) => {
    ws.onopen = ok;
    ws.onerror = () => bad(new Error('could not connect to the browser tab'));
  });
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { ok, bad, timer } = pending.get(msg.id);
      clearTimeout(timer);
      pending.delete(msg.id);
      msg.error ? bad(new Error(msg.error.message)) : ok(msg.result);
    } else if (msg.method) {
      for (const fn of listeners.get(msg.method) || []) fn(msg.params);
    }
  };
  const page = {
    send(method, params = {}, timeoutMs = 15000) {
      return new Promise((ok, bad) => {
        const n = ++id;
        const timer = setTimeout(() => {
          pending.delete(n);
          bad(new Error(`timeout: ${method}`));
        }, timeoutMs);
        pending.set(n, { ok, bad, timer });
        ws.send(JSON.stringify({ id: n, method, params }));
      });
    },
    on(method, fn) {
      if (!listeners.has(method)) listeners.set(method, []);
      listeners.get(method).push(fn);
    },
    async eval(expression, timeoutMs = 10000) {
      const r = await page.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, timeoutMs);
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async goto(url, waitMs = 1500) {
      await page.send('Page.navigate', { url }, 30000);
      await waitForLoad(page, 20000);
      await sleep(waitMs);
    },
    async viewport(name) {
      const v = VIEWPORTS[name] || VIEWPORTS.desktop;
      await page.send('Emulation.setDeviceMetricsOverride', v);
      await page.send('Emulation.setTouchEmulationEnabled', { enabled: v.mobile });
    },
    async click(x, y) {
      for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased'])
        await page.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    },
    /** PNG at full size, or a smaller JPEG when scale < 1 (cheaper for an AI to look at). */
    async screenshot(scale = 1) {
      const params = { format: 'png' };
      if (scale < 1) {
        const m = await page.send('Page.getLayoutMetrics');
        const v = m.cssVisualViewport || m.visualViewport;
        Object.assign(params, { format: 'jpeg', quality: 70, clip: { x: v.pageX || 0, y: v.pageY || 0, width: v.clientWidth, height: v.clientHeight, scale } });
      }
      const r = await page.send('Page.captureScreenshot', params, 20000);
      return Buffer.from(r.data, 'base64');
    },
    close() {
      try {
        ws.close();
      } catch {
        /* already closed */
      }
    },
  };
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Log.enable');
  await page.send('Network.enable');
  return page;
}

async function waitForLoad(page, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await page.eval('document.readyState', 3000)) === 'complete') return;
    } catch {
      /* navigating */
    }
    await sleep(200);
  }
}

/** Collects errors on a page into the given list. */
export function watchErrors(page, origin, sink) {
  page.on('Runtime.exceptionThrown', (p) =>
    sink({ type: 'exception', message: p.exceptionDetails.exception?.description?.split('\n')[0] || p.exceptionDetails.text, where: p.exceptionDetails.url || '' }),
  );
  page.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error' || p.type === 'assert')
      sink({ type: 'console-error', message: p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300) });
  });
  const noise = (u) => /favicon\.ico|apple-touch-icon|robots\.txt/i.test(u || '');
  page.on('Log.entryAdded', (p) => {
    // "Failed to load resource" duplicates the network events below, which carry the URL.
    if (p.entry.level === 'error' && p.entry.source !== 'console-api' && !/^Failed to load resource/.test(p.entry.text) && !noise(p.entry.url))
      sink({ type: 'log-error', message: `${p.entry.text}`.slice(0, 300), where: p.entry.url || '' });
  });
  page.on('Network.responseReceived', (p) => {
    const u = p.response.url;
    if (p.response.status >= 400 && sameOrigin(u, origin) && !noise(u) && ['Document', 'XHR', 'Fetch', 'Script', 'Stylesheet', 'Image'].includes(p.type))
      sink({ type: `http-${p.response.status}`, message: `${p.type} ${stripQuery(u)}`, where: u });
  });
  page.on('Network.loadingFailed', (p) => {
    if (!p.canceled && p.type !== 'Ping' && !/ERR_ABORTED/.test(p.errorText)) sink({ type: 'network-failed', message: `${p.type} ${p.errorText}`, where: '' });
  });
}

export function sameOrigin(u, origin) {
  try {
    return new URL(u).origin === origin;
  } catch {
    return false;
  }
}
export function stripQuery(u) {
  try {
    const x = new URL(u);
    return x.origin + x.pathname;
  } catch {
    return u;
  }
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Small seeded random generator (mulberry32) so runs can be repeated. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

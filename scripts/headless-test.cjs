const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== RUNNING HEADLESS CHROMIUM AUDIT ===');
  const chrome = spawn('/usr/bin/chromium', [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--remote-debugging-port=9240',
    'http://127.0.0.1:3000/',
  ]);

  try {
    await sleep(2000);
    const targets = await fetchJson('http://127.0.0.1:9240/json/list');
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();
    const consoleLogs = [];
    const pageErrors = [];

    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const curId = msgId++;
        pending.set(curId, { resolve, reject });
        ws.send(JSON.stringify({ id: curId, method, params }));
      });

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        consoleLogs.push(`[Console ${msg.params.type}] ${text}`);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const errText = msg.params.exceptionDetails.text || msg.params.exceptionDetails.exception?.description || 'Unknown error';
        pageErrors.push(`[Runtime Exception] ${errText}`);
      }
    });

    await new Promise((r) => ws.on('open', r));
    await send('Page.enable');
    await send('Runtime.enable');

    console.log('1. Waiting for splash screen transition (signed out fresh load)...');
    await sleep(2500);

    // Screenshot 1: Signed out
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '../screenshots/signed-out.png'), Buffer.from(shot1.data, 'base64'));
    console.log('   Saved: screenshots/signed-out.png');

    const pageText1 = await send('Runtime.evaluate', {
      expression: 'document.body.innerText',
      returnByValue: true,
    });
    console.log('   Signed-out view body text excerpt:\n', pageText1.result?.value?.slice(0, 150).replace(/\n/g, ' '));

    // 2. Click Sign In to open modal
    console.log('2. Clicking Sign In to open authentication modal...');
    const clickSignIn = await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const signInBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('sign in'));
        if (signInBtn) {
          signInBtn.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true,
    });
    console.log('   Sign In clicked:', clickSignIn.result?.value);
    await sleep(1500);

    // Screenshot 2: Auth modal opened / sign in flow
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '../screenshots/after-signin-open.png'), Buffer.from(shot2.data, 'base64'));
    console.log('   Saved: screenshots/after-signin-open.png');

    const modalCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const h = Array.from(document.querySelectorAll('h2, h3, button')).map(e => e.textContent.trim());
        return h.filter(t => t.toLowerCase().includes('sign in') || t.toLowerCase().includes('account') || t.toLowerCase().includes('password'));
      })()`,
      returnByValue: true,
    });
    console.log('   Modal elements found:', modalCheck.result?.value);

    // 3. Reload the page
    console.log('3. Reloading page...');
    await send('Page.reload');
    await sleep(2500);

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '../screenshots/reloaded.png'), Buffer.from(shot3.data, 'base64'));
    console.log('   Saved: screenshots/reloaded.png');

    console.log('=== CONSOLE LOGS CAPTURED ===');
    if (consoleLogs.length === 0) {
      console.log('   (No console logs emitted)');
    } else {
      consoleLogs.forEach((l) => console.log('  ', l));
    }

    console.log('=== RUNTIME ERRORS CAPTURED ===');
    if (pageErrors.length === 0) {
      console.log('   PASS: 0 runtime errors / exceptions captured!');
    } else {
      pageErrors.forEach((e) => console.error('  ', e));
      throw new Error(`Page captured ${pageErrors.length} errors`);
    }

    console.log('=== HEADLESS CHROMIUM AUDIT PASSED ===');
  } finally {
    chrome.kill();
  }
}

run().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});

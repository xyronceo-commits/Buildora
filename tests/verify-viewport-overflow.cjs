// tests/verify-viewport-overflow.cjs
// Validates viewport rendering and absence of horizontal overflow at 360px and 390px
// in both Light and Dark mode using Chrome DevTools Protocol (CDP).

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runViewportAudit() {
  console.log('=== RUNNING REAL USER JOURNEY: OPEN FORGOT PASSWORD MODAL & AUDIT VIEWPORTS ===');

  const chromeProc = spawn('/usr/bin/chromium', [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9223',
    'http://127.0.0.1:3000/',
  ]);

  await sleep(1500);

  const WebSocket = require('ws');

  const versionInfo = await fetchJson('http://127.0.0.1:9223/json/version');
  console.log('Connected to browser via CDP WebSocket:', versionInfo['Browser']);

  const targets = await fetchJson('http://127.0.0.1:9223/json/list');
  const pageTarget = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });

  await new Promise((resolve) => ws.on('open', resolve));

  function sendCmd(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCmd('Page.enable');
  await sendCmd('DOM.enable');

  // Wait for initial page and splash screen to complete
  console.log('1. Waiting for splash screen transition...');
  await sleep(2500);

  // Click Sign In on onboarding screen
  console.log('2. Clicking "Sign In" link to open authentication modal...');
  const clickSignInRes = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const signInBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('sign in'));
        if (signInBtn) {
          signInBtn.click();
          return true;
        }
        return false;
      })()
    `,
    returnByValue: true,
  });
  console.log('   Sign-in button clicked:', clickSignInRes.result.value);

  await sleep(800);

  // Verify Sign In modal opened with Forgot Password link under password field
  console.log('3. Verifying Forgot password link exists under password field...');
  const forgotLinkRes = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const forgotBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('forgot password'));
        if (forgotBtn) {
          forgotBtn.click();
          return true;
        }
        return false;
      })()
    `,
    returnByValue: true,
  });
  console.log('   Forgot password link clicked:', forgotLinkRes.result.value);

  if (!forgotLinkRes.result.value) {
    throw new Error('Forgot password button not found in sign-in modal!');
  }

  await sleep(800);

  const viewports = [
    { width: 360, height: 780, name: '360px (Small Mobile)' },
    { width: 390, height: 844, name: '390px (Standard Mobile)' },
  ];

  const modes = ['light', 'dark'];

  for (const vp of viewports) {
    for (const theme of modes) {
      console.log(`\n--- Testing Viewport: ${vp.name} | Theme: ${theme.toUpperCase()} ---`);

      // Set viewport size
      await sendCmd('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: true,
      });

      // Apply theme mode
      if (theme === 'dark') {
        await sendCmd('Runtime.evaluate', {
          expression: `document.documentElement.classList.add('dark');`,
        });
      } else {
        await sendCmd('Runtime.evaluate', {
          expression: `document.documentElement.classList.remove('dark');`,
        });
      }

      await sleep(500);

      // Measure scrollWidth vs innerWidth and check for overflow
      const evalResult = await sendCmd('Runtime.evaluate', {
        expression: `
          (() => {
            const docWidth = document.documentElement.scrollWidth;
            const bodyWidth = document.body.scrollWidth;
            const windowWidth = window.innerWidth;
            const hasHorizontalScroll = docWidth > windowWidth || bodyWidth > windowWidth;

            // Check if forgot password modal is visible and bounds
            const modalTitle = Array.from(document.querySelectorAll('p, h2, h3, div')).find(
              el => el.textContent && el.textContent.includes('Reset Account Password')
            );

            const emailInput = document.querySelector('input[type="email"]');
            const submitBtn = Array.from(document.querySelectorAll('button')).find(
              b => b.textContent && (b.textContent.includes('Send reset link') || b.textContent.includes('Send Reset Link'))
            );
            const backLink = Array.from(document.querySelectorAll('button')).find(
              b => b.textContent && b.textContent.includes('Back to sign in')
            );

            // Check bounding box of modal card
            const modalDialog = document.querySelector('.relative.w-full.max-w-md');
            let modalBoundingRight = 0;
            let modalOverflows = false;
            if (modalDialog) {
              const rect = modalDialog.getBoundingClientRect();
              modalBoundingRight = rect.right;
              modalOverflows = rect.right > windowWidth;
            }

            return {
              windowWidth,
              docWidth,
              bodyWidth,
              hasHorizontalScroll,
              modalVisible: Boolean(modalTitle),
              hasEmailInput: Boolean(emailInput),
              hasSubmitBtn: Boolean(submitBtn),
              hasBackLink: Boolean(backLink),
              modalBoundingRight,
              modalOverflows,
            };
          })()
        `,
        returnByValue: true,
      });

      const res = evalResult.result.value;
      console.log(`   Window Width: ${res.windowWidth}px`);
      console.log(`   Doc Scroll Width: ${res.docWidth}px`);
      console.log(`   Body Scroll Width: ${res.bodyWidth}px`);
      console.log(`   Modal Max Right: ${res.modalBoundingRight}px (<= ${res.windowWidth}px: ${!res.modalOverflows})`);
      console.log(`   Horizontal Scroll / Overflow: ${res.hasHorizontalScroll ? 'YES (OVERFLOW DETECTED!)' : 'NO (CLEAN FIT)'}`);
      console.log(`   Modal Header Visible: ${res.modalVisible}`);
      console.log(`   Email Input Present: ${res.hasEmailInput}`);
      console.log(`   Send Reset Link Button Present: ${res.hasSubmitBtn}`);
      console.log(`   Back To Sign In Link Present: ${res.hasBackLink}`);

      if (res.hasHorizontalScroll || res.modalOverflows) {
        throw new Error(`Horizontal overflow detected at ${vp.width}px in ${theme} mode!`);
      }
      if (!res.modalVisible || !res.hasEmailInput || !res.hasSubmitBtn || !res.hasBackLink) {
        throw new Error(`Required modal elements missing at ${vp.width}px in ${theme} mode!`);
      }

      // Take screenshot
      const screenshotData = await sendCmd('Page.captureScreenshot', { format: 'png' });
      const filename = `/tmp/modal_${vp.width}_${theme}.png`;
      fs.writeFileSync(filename, Buffer.from(screenshotData.data, 'base64'));
      console.log(`   Screenshot saved: ${filename} (${fs.statSync(filename).size} bytes)`);
      console.log(`   [PASS] ${vp.name} (${theme} mode): No horizontal overflow, all elements fit cleanly.`);
    }
  }

  ws.close();
  chromeProc.kill();
  console.log('\n=== ALL VIEWPORT AUDITS COMPLETED SUCCESSFULLY WITH 0 OVERFLOW ===');
  process.exit(0);
}

runViewportAudit().catch((err) => {
  console.error('Viewport audit failed:', err);
  process.exit(1);
});

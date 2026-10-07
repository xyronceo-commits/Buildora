const http = require('http');

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.callbacks = new Map();
    this.consoleErrors = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          if (msg.params.type === 'error') {
            const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
            this.consoleErrors.push(text);
          }
        }
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runCheck() {
  const pages = await getPages();
  const page = pages.find(p => p.type === 'page');
  if (!page) throw new Error('No page found');

  const client = new CDPClient(page.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const viewports = [
    { name: '360px', width: 360, height: 780 },
    { name: '390px', width: 390, height: 844 },
  ];

  const themes = ['light', 'dark'];

  // Test targets:
  // 1. Client Home
  // 2. Sign-in modal
  // 3. Supplier dashboard
  // 4. Admin dashboard

  console.log('=== CHROMIUM VIEWPORT & CONSOLE ERROR AUDIT ===\n');

  for (const vp of viewports) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: true,
    });

    for (const theme of themes) {
      console.log(`--- Viewport: ${vp.name} | Theme: ${theme.toUpperCase()} ---`);

      // 1. Client Home
      await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/' });
      await new Promise(r => setTimeout(r, 1200));
      
      // Set theme
      await client.evaluate(`
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add('${theme}');
        localStorage.setItem('constrora_theme', '${theme}');
      `);
      await new Promise(r => setTimeout(r, 300));

      let hasOverflow = await client.evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
      let scrollW = await client.evaluate(`document.documentElement.scrollWidth`);
      let innerW = await client.evaluate(`window.innerWidth`);
      let errors = [...client.consoleErrors];
      client.consoleErrors = [];

      console.log(`[Client Home] Overflow: ${hasOverflow} (scrollWidth: ${scrollW}px, innerWidth: ${innerW}px) | Errors: ${errors.length === 0 ? 'None' : errors.join('; ')}`);

      // 2. Sign-in Modal
      // Trigger sign-in modal via button click
      await client.evaluate(`
        const btn = document.querySelector('button[aria-label="Account"]') || 
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign In') || b.textContent.includes('Get Started') || b.textContent.includes('Login'));
        if (btn) btn.click();
      `);
      await new Promise(r => setTimeout(r, 600));

      hasOverflow = await client.evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
      scrollW = await client.evaluate(`document.documentElement.scrollWidth`);
      innerW = await client.evaluate(`window.innerWidth`);
      errors = [...client.consoleErrors];
      client.consoleErrors = [];

      console.log(`[Sign-In Modal] Overflow: ${hasOverflow} (scrollWidth: ${scrollW}px, innerWidth: ${innerW}px) | Errors: ${errors.length === 0 ? 'None' : errors.join('; ')}`);

      // Close modal
      await client.evaluate(`
        const closeBtn = document.querySelector('button[aria-label="Close"]') || document.querySelector('div[role="dialog"] button');
        if (closeBtn) closeBtn.click();
      `);
      await new Promise(r => setTimeout(r, 300));

      // 3. Supplier Dashboard (navigate to hash/view or tab)
      await client.evaluate(`
        const supBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Supplier') || b.textContent.includes('Suppliers'));
        if (supBtn) supBtn.click();
      `);
      await new Promise(r => setTimeout(r, 600));

      hasOverflow = await client.evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
      scrollW = await client.evaluate(`document.documentElement.scrollWidth`);
      innerW = await client.evaluate(`window.innerWidth`);
      errors = [...client.consoleErrors];
      client.consoleErrors = [];

      console.log(`[Supplier View] Overflow: ${hasOverflow} (scrollWidth: ${scrollW}px, innerWidth: ${innerW}px) | Errors: ${errors.length === 0 ? 'None' : errors.join('; ')}`);

      // 4. Admin Dashboard (protected view / auth check)
      await client.evaluate(`
        window.history.pushState({}, '', '/admin');
      `);
      await new Promise(r => setTimeout(r, 600));

      hasOverflow = await client.evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
      scrollW = await client.evaluate(`document.documentElement.scrollWidth`);
      innerW = await client.evaluate(`window.innerWidth`);
      errors = [...client.consoleErrors];
      client.consoleErrors = [];

      console.log(`[Admin Dashboard] Overflow: ${hasOverflow} (scrollWidth: ${scrollW}px, innerWidth: ${innerW}px) | Errors: ${errors.length === 0 ? 'None' : errors.join('; ')}`);
      console.log('');
    }
  }

  client.close();
  process.exit(0);
}

runCheck().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});

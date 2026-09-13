const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const BUILD_DIR = path.join(__dirname, 'build', 'web');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const PREVIEW_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReachWithUs — Mobile App Preview & Device Simulator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    :root {
      --bg-dark: #090D16;
      --card-bg: #111827;
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #4F46E5;
      --primary-light: #818CF8;
      --accent: #F59E0B;
      --success: #10B981;
    }
    body {
      background-color: var(--bg-dark);
      color: #E2E8F0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    /* Top Navigation Bar */
    .top-bar {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .app-logo {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }
    .app-logo svg {
      width: 22px;
      height: 22px;
      fill: white;
    }
    .brand-info h1 {
      font-size: 17px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-badge {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(79, 70, 229, 0.25);
      border: 1px solid rgba(129, 140, 248, 0.4);
      color: var(--primary-light);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #94A3B8;
    }

    /* Toolbar Controls */
    .controls-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .device-switcher {
      display: flex;
      background: rgba(15, 23, 42, 0.8);
      padding: 3px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
    }
    .device-btn {
      background: transparent;
      border: none;
      color: #94A3B8;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 7px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .device-btn:hover {
      color: #FFFFFF;
    }
    .device-btn.active {
      background: #4F46E5;
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
    }

    .scale-select {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--card-border);
      color: #E2E8F0;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 8px;
      outline: none;
      cursor: pointer;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
      border: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.04);
      color: #CBD5E1;
    }
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
    }
    .action-btn.primary {
      background: #4F46E5;
      border-color: #6366F1;
      color: white;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    }
    .action-btn.primary:hover {
      background: #4338CA;
    }

    /* Main Simulator Layout */
    .simulator-container {
      display: flex;
      flex: 1;
      padding: 24px;
      gap: 32px;
      align-items: flex-start;
      justify-content: center;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    /* Phone Device Frame */
    .phone-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .phone-mockup {
      width: 393px;
      height: 840px;
      background: #000000;
      border-radius: 54px;
      position: relative;
      box-shadow: 
        0 0 0 12px #1E2538,
        0 0 0 14px #0F1422,
        0 25px 60px -10px rgba(0, 0, 0, 0.8),
        0 10px 20px -5px rgba(79, 70, 229, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Dynamic Island / Notch */
    .phone-notch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 30px;
      background: #000000;
      border-radius: 20px;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    }
    .notch-camera {
      width: 11px;
      height: 11px;
      background: #111;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .notch-sensor {
      width: 8px;
      height: 8px;
      background: #0c0f1c;
      border-radius: 50%;
    }

    /* Status Bar */
    .phone-status-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      font-size: 13px;
      font-weight: 600;
      color: #FFFFFF;
      z-index: 40;
      pointer-events: none;
      background: linear-gradient(180deg, rgba(9, 13, 22, 0.95) 0%, rgba(9, 13, 22, 0) 100%);
    }
    .status-icons {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Flutter Frame */
    .phone-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: #090D16;
      flex: 1;
      padding-top: 24px;
    }

    /* Home Bar */
    .phone-home-indicator {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 134px;
      height: 4px;
      background: rgba(255, 255, 255, 0.45);
      border-radius: 100px;
      z-index: 50;
      pointer-events: none;
    }

    /* Right Side Panel: App Details & Guide */
    .details-panel {
      flex: 1;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .info-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
    }
    .info-card h3 {
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-card p {
      font-size: 13.5px;
      line-height: 1.6;
      color: #94A3B8;
      margin-bottom: 16px;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 0.2s;
    }
    .feature-item:hover {
      background: rgba(79, 70, 229, 0.08);
      border-color: rgba(79, 70, 229, 0.2);
    }
    .feature-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }
    .feature-text strong {
      display: block;
      font-size: 13.5px;
      color: #F1F5F9;
      margin-bottom: 2px;
    }
    .feature-text span {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.4;
      display: block;
    }

    /* Test Credentials Box */
    .cred-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    .cred-box {
      background: rgba(15, 23, 42, 0.6);
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .cred-label {
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .cred-value {
      font-family: monospace;
      font-size: 12px;
      color: #818CF8;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Connected Systems Status */
    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
      font-size: 12.5px;
      margin-bottom: 8px;
    }
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #10B981;
      font-weight: 600;
      font-size: 12px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10B981;
    }

    @media (max-width: 960px) {
      .simulator-container {
        flex-direction: column;
        align-items: center;
      }
      .details-panel {
        max-width: 100%;
        width: 100%;
      }
    }
  </style>
</head>
<body>

  <!-- Header / Navigation -->
  <header class="top-bar">
    <div class="brand-section">
      <img src="/logo.png" alt="ReachWithUs" style="height: 38px; object-fit: contain; border-radius: 6px;">
      <div class="brand-info">
        <h1>ReachWithUs Mobile <span class="brand-badge">Flutter Engine</span></h1>
        <div class="brand-subtitle">Requirement Discovery & Direct Leads Mobile Client</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-wrapper">
      <div class="device-switcher">
        <button class="device-btn active" onclick="setDevice('iphone')">
          <span>📱</span> iPhone 16
        </button>
        <button class="device-btn" onclick="setDevice('pixel')">
          <span>🤖</span> Pixel 9
        </button>
        <button class="device-btn" onclick="setDevice('tablet')">
          <span>💻</span> Tablet
        </button>
      </div>

      <select class="scale-select" id="scaleSelect" onchange="changeScale(this.value)">
        <option value="1">100% Size</option>
        <option value="0.9">90% Scale</option>
        <option value="0.8">80% Scale</option>
      </select>

      <button class="action-btn" onclick="reloadFrame()" title="Reload Mobile App">
        🔄 Refresh
      </button>

      <a href="/app" target="_blank" class="action-btn primary">
        ↗ Full Screen App
      </a>
    </div>
  </header>

  <!-- Main Simulator Layout -->
  <main class="simulator-container">
    
    <!-- Phone Mockup Stage -->
    <div class="phone-stage">
      <div class="phone-mockup" id="phoneMockup">
        
        <!-- Status Bar -->
        <div class="phone-status-bar">
          <span id="liveClock">9:41</span>
          <div class="status-icons">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.3c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.7-1.7C9.07 20.26 11.02 21 13.14 21c4.97 0 9-4.03 9-9s-4.03-9-9.14-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
          </div>
        </div>

        <!-- Dynamic Island -->
        <div class="phone-notch">
          <div class="notch-sensor"></div>
          <div class="notch-camera"></div>
        </div>

        <!-- Embedded Flutter App -->
        <iframe id="appFrame" class="phone-iframe" src="/app" allow="geolocation; microphone; camera; clipboard-read; clipboard-write"></iframe>

        <!-- Home Bar Indicator -->
        <div class="phone-home-indicator"></div>
      </div>
    </div>

    <!-- Right Side Information & Interactive Guide -->
    <div class="details-panel">
      
      <!-- Ecosystem Services -->
      <div class="info-card">
        <h3>⚡ Active Ecosystem Services</h3>
        
        <div class="status-row">
          <span>Backend REST API</span>
          <span class="status-indicator"><span class="status-dot"></span> Online (:5000)</span>
        </div>
        <div class="status-row">
          <span>Web Marketplace</span>
          <span class="status-indicator"><span class="status-dot"></span> Online (:3000)</span>
        </div>
        <div class="status-row">
          <span>Admin Moderation Portal</span>
          <span class="status-indicator"><span class="status-dot"></span> Online (:3001)</span>
        </div>
        <div class="status-row">
          <span>Mobile Flutter Web Engine</span>
          <span class="status-indicator"><span class="status-dot"></span> Active (:3002)</span>
        </div>
      </div>

      <!-- Key Mobile Features -->
      <div class="info-card">
        <h3>📱 Mobile Features Ready to Test</h3>
        <p>This is the compiled Flutter mobile application connected to your live NestJS backend and PostgreSQL database.</p>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(79, 70, 229, 0.15); color: #818CF8;">📰</div>
            <div class="feature-text">
              <strong>Requirement Feed & Search</strong>
              <span>Real-time cards with urgency badges, category filters, budgets, and author info.</span>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(245, 158, 11, 0.15); color: #F59E0B;">⭐</div>
            <div class="feature-text">
              <strong>₹10/mo VIP Pass Subscription</strong>
              <span>Simulate instant Razorpay/card checkout to unlock verified contact numbers.</span>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(16, 185, 129, 0.15); color: #10B981;">💬</div>
            <div class="feature-text">
              <strong>1-Tap Call & WhatsApp Direct</strong>
              <span>Once unlocked, tap to dial phone numbers or launch WhatsApp chat with leads.</span>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon" style="background: rgba(236, 72, 153, 0.15); color: #EC4899;">➕</div>
            <div class="feature-text">
              <strong>Post Buyer Requirements</strong>
              <span>Category selector, location picker, quantity, budget & urgency tags.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Test Accounts -->
      <div class="info-card">
        <h3>🔑 Demo Credentials</h3>
        <p>You can sign in with an existing account or create a brand new account directly from the Profile tab in the mobile app.</p>
        
        <div class="cred-grid">
          <div class="cred-box">
            <div class="cred-label">Admin Email</div>
            <div class="cred-value">
              <span>admin@reachwithus.com</span>
            </div>
          </div>
          <div class="cred-box">
            <div class="cred-label">Password</div>
            <div class="cred-value">
              <span>Admin@12345</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>

  <script>
    // Live Clock
    function updateClock() {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      const el = document.getElementById('liveClock');
      if (el) el.textContent = hours + ':' + minutes;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Device Switcher
    function setDevice(type) {
      document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
      const mockup = document.getElementById('phoneMockup');
      
      if (type === 'iphone') {
        event.currentTarget.classList.add('active');
        mockup.style.width = '393px';
        mockup.style.height = '840px';
        mockup.style.borderRadius = '54px';
      } else if (type === 'pixel') {
        event.currentTarget.classList.add('active');
        mockup.style.width = '412px';
        mockup.style.height = '880px';
        mockup.style.borderRadius = '40px';
      } else if (type === 'tablet') {
        event.currentTarget.classList.add('active');
        mockup.style.width = '640px';
        mockup.style.height = '860px';
        mockup.style.borderRadius = '32px';
      }
    }

    // Scale
    function changeScale(val) {
      const mockup = document.getElementById('phoneMockup');
      mockup.style.transform = 'scale(' + val + ')';
      mockup.style.transformOrigin = 'top center';
    }

    // Reload
    function reloadFrame() {
      const frame = document.getElementById('appFrame');
      frame.src = '/app?' + new Date().getTime();
    }
  </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  // Root or /preview returns the phone simulator
  if (pathname === '/' || pathname === '/preview') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(PREVIEW_HTML);
    return;
  }

  // /logo.png returns the uploaded brand logo
  if (pathname === '/logo.png') {
    const logoPath = path.join(__dirname, 'assets', 'images', 'logo.png');
    if (fs.existsSync(logoPath)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      fs.createReadStream(logoPath).pipe(res);
      return;
    }
  }

  // /app or /app/ returns Flutter web index.html
  if (pathname === '/app' || pathname === '/app/') {
    const indexPath = path.join(BUILD_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }
  }

  // Serve static files from BUILD_DIR
  let relativePath = pathname;
  if (relativePath.startsWith('/app/')) {
    relativePath = relativePath.replace('/app/', '/');
  }
  let filePath = path.join(BUILD_DIR, relativePath);

  // Security check: stay inside BUILD_DIR
  if (!filePath.startsWith(BUILD_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Fallback for Flutter routing
      const fallbackPath = path.join(BUILD_DIR, 'index.html');
      if (fs.existsSync(fallbackPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(fallbackPath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Mobile Preview Server running at http://localhost:${PORT}`);
  console.log(`Direct Flutter App available at http://localhost:${PORT}/app`);
});

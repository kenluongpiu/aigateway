/**
 * Static HTML content for public pages
 */
import fs from 'fs';
import path from 'path';
let publicIndexHtml;
try {
    // For build time, read the HTML file
    publicIndexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
}
catch (error) {
    // Fallback HTML if file reading fails
    publicIndexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portkey AI Gateway</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      max-width: 800px;
    }
    .logo {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .tagline {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }
    .feature {
      background: rgba(255, 255, 255, 0.1);
      padding: 1.5rem;
      border-radius: 0.5rem;
      backdrop-filter: blur(10px);
    }
    .feature h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    .feature p {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }
    .links {
      margin-top: 2rem;
    }
    .link {
      display: inline-block;
      margin: 0 1rem;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      text-decoration: none;
      border-radius: 0.375rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .link:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
    .status {
      margin-top: 2rem;
      padding: 1rem;
      background: rgba(0, 255, 0, 0.1);
      border-radius: 0.375rem;
      border: 1px solid rgba(0, 255, 0, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🚀 AI Gateway</div>
    <div class="tagline">Route to 250+ LLMs with 1 fast & friendly API</div>
    
    <div class="features">
      <div class="feature">
        <h3>⚡ Blazing Fast</h3>
        <p>&lt;1ms latency with 122kb footprint</p>
      </div>
      <div class="feature">
        <h3>🔄 Reliable</h3>
        <p>Automatic retries and fallbacks</p>
      </div>
      <div class="feature">
        <h3>📊 Scalable</h3>
        <p>Load balancing and conditional routing</p>
      </div>
      <div class="feature">
        <h3>🔐 Secure</h3>
        <p>Built-in guardrails and security</p>
      </div>
    </div>
    
    <div class="links">
      <a href="/docs" class="link">📚 API Docs</a>
      <a href="/v1/reference/models" class="link">🤖 Models</a>
      <a href="/v1/reference/providers" class="link">🏢 Providers</a>
    </div>
    
    <div class="status">
      <strong>✅ Gateway is running!</strong><br>
      API Base URL: <code>http://localhost:8787/v1</code>
    </div>
  </div>

  <script>
    // Simple health check
    fetch('/v1/reference/models')
      .then(response => {
        if (response.ok) {
          console.log('✅ Gateway API is healthy');
        }
      })
      .catch(error => {
        console.warn('⚠️ Gateway API check failed:', error);
      });
  </script>
</body>
</html>
  `;
}
export { publicIndexHtml };

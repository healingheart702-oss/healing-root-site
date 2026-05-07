<meta name="google-site-verification" content="cPJ3_emx8r6W7a_9249IO_Aj4NEH15CCtPqEgc18FN8" />
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Healing Social — Project Documentation</title>
<style>
  :root{
    --green-900:#0b4d2e;
    --green-700:#2e8b57;
    --muted:#6b6b6b;
    --card:#ffffff;
    --bg:#f5f8f5;
    --accent:#dfffe4;
    --maxw:1000px;
    --radius:12px;
  }
  *{box-sizing:border-box}
  body{
    margin:0;
    font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background:var(--bg);
    color:#17202a;
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
  }

  header{
    background: linear-gradient(180deg,var(--green-900),var(--green-700));
    color:white;
    padding:36px 20px;
    text-align:center;
  }
  .container{max-width:var(--maxw); margin:24px auto; padding:0 18px;}
  .banner{
    display:flex;
    gap:18px;
    align-items:center;
    justify-content:center;
    flex-wrap:wrap;
  }
  .logo {
    width:110px;height:110px;border-radius:18px;
    background:linear-gradient(135deg,#e6f7ea,#bfeed0);
    display:flex;align-items:center;justify-content:center;
    font-weight:900;color:var(--green-900);font-size:16px;
    box-shadow:0 6px 18px rgba(12,67,37,0.12);
    text-align: center;
    line-height: 1.1;
  }
  h1{margin:8px 0 0; font-size:28px; letter-spacing:0.2px;}
  p.lead{margin:8px 0 0; color:#e8f6ea; opacity:0.95}

  .card{
    background:var(--card);
    border-radius:var(--radius);
    padding:20px;
    box-shadow:0 6px 20px rgba(22,34,28,0.06);
    margin-bottom:18px;
  }

  .grid{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:16px;
  }
  @media (max-width:800px){ .grid{grid-template-columns:1fr} .banner{gap:12px} }

  h2{
    color:var(--green-900);
    margin:0 0 10px;
    font-size:18px;
  }
  ul{margin:8px 0 0 18px; color:var(--muted)}
  li{margin:6px 0}
  .cta{
    display:inline-block;
    background:var(--green-700);
    color:white;
    padding:10px 16px;
    text-decoration:none;
    border-radius:8px;
    font-weight:600;
    box-shadow:0 8px 20px rgba(46,139,87,0.18);
  }

  .meta{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .pill{background:var(--accent); color:var(--green-900); padding:8px 12px;border-radius:999px;font-weight:600}
  footer{color:#7a7a7a;text-align:center;padding:28px 10px; font-size:14px}
  .small{font-size:13px;color:var(--muted)}

  pre{
    background:#0f1720; color:#d1f7d8; padding:12px;border-radius:8px;overflow:auto;font-size:13px;
  }
  .contacts{display:flex;gap:12px;flex-wrap:wrap}
  .contact-card{background:#fff7ea;padding:12px;border-radius:10px;color:#7a4b00}
</style>
</head>
<body>

<header>
  <div class="container">
    <div class="banner">
      <div class="logo">HEALING<br><span style="font-size:10px">SOCIAL</span></div>
      <div style="text-align:left;min-width:220px">
        <h1>Healing Social</h1>
        <p class="lead">Connecting People. Building Community.</p>
      </div>
    </div>
  </div>
</header>

<main class="container" style="margin-top:18px;">

  <section class="card">
    <div class="meta" style="justify-content:space-between;align-items:center">
      <div>
        <strong style="font-size:16px">Project — Full-Stack Social Network</strong>
        <div class="small">Real-time "Facebook-style" progressive web app built with Firebase, Cloudinary, and Vanilla JS.</div>
      </div>
      <div style="text-align:right">
        <span class="pill">V2.0 — Live Evolution</span>
      </div>
    </div>
  </section>

  <section class="grid">
    <div class="card">
      <h2>Project Architecture</h2>
      <p class="small">Healing Social is a high-performance networking platform designed for real-time interaction. It features a decentralized content feed, persistent user sessions, and a professional-grade media management system.</p>

      <h3 style="margin-top:12px;font-size:15px;color:#133a2a">Core Features</h3>
      <ul>
        <li><strong>Real-time Feed</strong> — Multimedia posts & reactions</li>
        <li><strong>Stories & Reels</strong> — Vertical video & 24hr status updates</li>
        <li><strong>Social Graph</strong> — Dynamic Follow/Unfollow system</li>
        <li><strong>Live Chat</strong> — Instant messaging with presence status</li>
      </ul>
    </div>

    <div class="card">
      <h2>Technical Stack</h2>
      <ul>
        <li><strong>Backend:</strong> Firebase (Auth, Firestore, Hosting)</li>
        <li><strong>Media Storage:</strong> Cloudinary (CDN-optimized uploads)</li>
        <li><strong>UI/UX:</strong> Mobile-first Responsive CSS (FB Architecture)</li>
        <li><strong>State Management:</strong> Real-time Firestore Observers</li>
        <li><strong>Presence:</strong> Online/Offline status tracking</li>
      </ul>
      <div style="margin-top:10px">
        <a class="cta" href="https://wa.me/2349138938301?text=Hello%20Developer">Contact Lead Developer</a>
      </div>
    </div>
  </section>

  <section class="card" style="margin-top:12px">
    <h2>Environment Configuration</h2>
    <p class="small">To run this project, ensure your `app.js` is configured with the following services:</p>
    <pre>
- Firebase: Firestore (Database) & Authentication
- Cloudinary: Unsigned Upload Presets for multimedia
- Deployment: GitHub Pages / Netlify / Vercel
    </pre>

    <p class="small" style="margin-top:8px"><strong>Status:</strong> The platform is currently optimized for mobile viewports (iPhone XR standard) and high-speed data environments.</p>
  </section>

  <section class="card" style="margin-top:12px">
    <h2>Project Management</h2>
    <div class="contacts">
      <div class="contact-card">
        <strong>Lead</strong><div>Olusegun Victor</div>
      </div>
      <div class="contact-card">
        <strong>WhatsApp</strong><div>09138938301</div>
      </div>
      <div class="contact-card">
        <strong>System</strong><div>Healing Root Ventures</div>
      </div>
    </div>
  </section>

  <section class="card" style="margin-top:12px">
    <h2>Ownership & Vision</h2>
    <p class="small">This platform is the official social hub for <strong>Healing Root Ventures</strong>. It represents a shift from niche marketplace functionality to a broad-scale community interaction engine.</p>
    <p class="small"><strong>Upcoming:</strong> Advanced analytics for influencers, story upload logic, and notification sound integration.</p>
  </section>

</main>

<footer>
  © 2026 Healing Social — Redefining Connection.  
</footer>

</body>
</html>

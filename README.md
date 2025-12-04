<meta name="google-site-verification" content="cPJ3_emx8r6W7a_9249IO_Aj4NEH15CCtPqEgc18FN8" />
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Healing Root Agro Ventures — README</title>
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
    font-weight:700;color:var(--green-900);font-size:14px;
    box-shadow:0 6px 18px rgba(12,67,37,0.12);
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
  nav-badges{display:inline-block}

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

  /* code box for README style */
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
      <div class="logo">HR<span style="display:block;font-size:11px;margin-top:-2px">Agro</span></div>
      <div style="text-align:left;min-width:220px">
        <h1>Healing Root Agro Ventures</h1>
        <p class="lead">Growing Quality. Nurturing Tomorrow.</p>
      </div>
    </div>
  </div>
</header>

<main class="container" style="margin-top:18px;">

  <section class="card">
    <div class="meta" style="justify-content:space-between;align-items:center">
      <div>
        <strong style="font-size:16px">Project — E-commerce Website</strong>
        <div class="small">Responsive HTML/CSS/JS static site with WhatsApp ordering integration — ready for GitHub Pages / Netlify.</div>
      </div>
      <div style="text-align:right">
        <span class="pill">Production-ready</span>
      </div>
    </div>
  </section>

  <section class="grid">
    <div class="card">
      <h2>About the Project</h2>
      <p class="small">This repository contains the source files for Healing Root Agro Ventures' multi-page e-commerce website. The site showcases products, services, contact channels, and integrates direct WhatsApp ordering links so customers can place orders instantly.</p>

      <h3 style="margin-top:12px;font-size:15px;color:#133a2a">Included Pages</h3>
      <ul>
        <li>Home — hero, featured products</li>
        <li>Products — product cards + WhatsApp order buttons</li>
        <li>About — company story & mission</li>
        <li>Contact — call, WhatsApp, email</li>
      </ul>
    </div>

    <div class="card">
      <h2>Products & Services</h2>
      <ul>
        <li><strong>Cassava stems</strong> — TME419, TMS30572</li>
        <li><strong>Hybrid plantain & banana suckers</strong></li>
        <li><strong>Tenera oil palm seedlings</strong></li>
        <li><strong>Coconut & pineapple seedlings</strong></li>
        <li><strong>Vegetable seeds & NPK fertilizers</strong></li>
        <li><strong>Services:</strong> Agro consultation, farm setup & training</li>
      </ul>
      <div style="margin-top:10px">
        <a class="cta" href="https://wa.me/2349138938301?text=Hello%20Healing%20Root%20Agro%20Ventures">Chat on WhatsApp</a>
      </div>
    </div>
  </section>

  <section class="card" style="margin-top:12px">
    <h2>Usage & Deployment</h2>
    <p class="small">Quick start:</p>
    <pre>
git clone &lt;this-repo-url&gt;
open index.html locally or deploy to GitHub Pages / Netlify / Vercel
Edit contact numbers (contact.html) to your live business phone before publishing.
    </pre>

    <p class="small" style="margin-top:8px">Recommended hosting: <strong>GitHub Pages</strong> for a free static site or <strong>Netlify/Vercel</strong> for easy CI/CD and custom domain setup.</p>
  </section>

  <section class="card" style="margin-top:12px">
    <h2>Contact</h2>
    <div class="contacts">
      <div class="contact-card">
        <strong>Call</strong><div>08153729342</div>
      </div>
      <div class="contact-card">
        <strong>WhatsApp</strong><div>09138938301</div>
      </div>
      <div class="contact-card">
        <strong>Email</strong><div>olasuposegunvictor@gmail.com</div>
      </div>
    </div>
  </section>

  <section class="card" style="margin-top:12px">
    <h2>License & Contribution</h2>
    <p class="small">This repository is the official property of <strong>Healing Root Agro Ventures</strong>. For contributions or forks, please contact the owner for permissions.</p>
    <p class="small">If you want help deploying or customizing the site (adding a cart, online payment, or form backend), I can prepare step-by-step instructions.</p>
  </section>

</main>

<footer>
  © 2025 Healing Root Agro Ventures — Built for farmers.  
</footer>

</body>
</html>

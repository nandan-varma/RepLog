const layout = (title: string, body: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; border-radius: 0 !important; }
    body {
      margin: 0;
      background: #fff;
      color: #000;
      font-family: -apple-system, system-ui, sans-serif;
      line-height: 1.5;
    }
    main {
      max-width: 640px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    h1 { font-size: 28px; margin: 0 0 24px; }
    h2 { font-size: 18px; margin: 32px 0 8px; }
    a { color: #000; }
    nav {
      border-bottom: 1px solid #000;
      padding: 16px 24px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <nav>RepLog</nav>
  <main>${body}</main>
</body>
</html>`;

export const homePage = () =>
  layout(
    'RepLog',
    `
    <h1>RepLog</h1>
    <p>Search exercises, track workouts, and get AI help at every step &mdash; entirely on your device.</p>
    <p><a href="/privacy">Privacy Policy</a></p>
  `,
  );

export const privacyPage = () =>
  layout(
    'Privacy Policy — RepLog',
    `
    <h1>Privacy Policy</h1>
    <p>RepLog does not require an account and does not store your workout data on any server. All workouts, sets, and history live only on your device.</p>
    <h2>AI features</h2>
    <p>When you use an AI feature (search, quick-log, coaching), the text you enter and a compact summary of relevant stats are sent to our server, which forwards them to our AI provider to generate a response. This data is not stored after the request completes.</p>
    <h2>Contact</h2>
    <p>Questions: nandanvarma.me@gmail.com</p>
  `,
  );

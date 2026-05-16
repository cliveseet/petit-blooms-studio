export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif; background: #f4efe4; color: #1f3028; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; border: 1px solid rgba(31,48,40,.14); border-radius: 1rem; background: rgba(244,239,228,.7); box-shadow: 0 18px 42px rgba(31,48,40,.08); }
      h1 { font: 400 1.7rem/1.15 Georgia, ui-serif, serif; margin: 0 0 .65rem; color: #203d30; }
      p { color: rgba(31,48,40,.7); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #203d30; color: #f4efe4; }
      .secondary { background: transparent; color: #203d30; border-color: rgba(31,48,40,.2); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}

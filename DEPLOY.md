# Deploying NeoGraph

This project is a TanStack Start app targeting Cloudflare Workers. You can
host it on your own Cloudflare account (recommended for a work laptop that
blocks `lovable.app` but allows `cloudflare.com` / `workers.dev`), or run
it locally.

---

## 1. Deploy to your own Cloudflare account

### Prerequisites
- A free [Cloudflare](https://dash.cloudflare.com/sign-up) account.
- [Bun](https://bun.sh) (or Node 20+ with npm/pnpm) installed locally.
- The project source (clone from GitHub via the Lovable → GitHub integration).

### Steps

```bash
# 1. Install deps
bun install

# 2. Build the Worker bundle
bun run build

# 3. Log in to Cloudflare (opens browser once)
bunx wrangler login

# 4. Deploy
bunx wrangler deploy
```

The first deploy prints a URL like
`https://neograph.<your-account>.workers.dev`. That URL is yours; bookmark
it on the work laptop. Re-run `bun run build && bunx wrangler deploy`
whenever you pull new changes.

### Optional: custom domain
In the Cloudflare dashboard → Workers & Pages → your worker → **Settings →
Triggers → Custom Domains**, attach any domain you've added to Cloudflare.

---

## 2. Run locally on the work laptop

```bash
bun install
bun run dev      # http://localhost:8080
```

No hosting, no account. Only needs Bun (or Node) installed. The dev server
listens on `localhost` only, so nothing leaves the laptop.

---

## 3. Vendor the WASM runtimes (zero third-party CDNs)

The IDE panel lazily downloads **Pyodide** (~10 MB, Python) and **WebR**
(~25 MB, R) from `cdn.jsdelivr.net` and `webr.r-wasm.org` the first time
you click RUN on that language. If those CDNs are blocked at work, copy
them into `public/` and point the app at the relative path.

### Vendor Pyodide
1. Download a release tarball from
   https://github.com/pyodide/pyodide/releases (file
   `pyodide-0.26.4.tar.bz2`, ~80 MB compressed).
2. Extract it and copy the `pyodide/` folder into `public/`:
   ```
   public/pyodide/
     pyodide.js
     pyodide.asm.wasm
     python_stdlib.zip
     ...
   ```
3. Set the env var before building:
   ```bash
   VITE_PYODIDE_URL=/pyodide/ bun run build
   ```

### Vendor WebR
1. Download the latest WebR distribution from
   https://github.com/r-wasm/webr/releases (file `webr-*.tar.gz`).
2. Extract its `dist/` contents into `public/webr/`:
   ```
   public/webr/
     webr.mjs
     webr-worker.js
     R.bin.wasm
     ...
   ```
3. Set the env var before building:
   ```bash
   VITE_WEBR_URL=/webr/webr.mjs bun run build
   ```

### Both at once
```bash
VITE_PYODIDE_URL=/pyodide/ \
VITE_WEBR_URL=/webr/webr.mjs \
bun run build && bunx wrangler deploy
```

After this, the deployed app makes **zero** third-party requests — Python
and R load from your own Worker. Note: Cloudflare Workers free tier has a
25 MB per-asset limit; the WebR `R.bin.wasm` is close to that. If you hit
it, host the vendored runtimes on Cloudflare R2 or another static bucket
and point the env vars at that URL instead.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `wrangler deploy` fails with "no account" | Run `bunx wrangler login` first. |
| Python/R never finish loading | The work network is blocking the CDN. Use option 3 (vendor) or run locally. |
| Worker exceeds 1 MB script size | Should not happen with this app, but if it does, run `bun run build -- --minify` and check `dist/_worker.js` size. |
| Custom domain shows 521/522 | DNS is proxied (orange cloud) but the Worker route isn't attached yet. Re-add it under Triggers. |

---

## What changed in the code for option 3?

`src/components/calc/IdePanel.tsx` now reads two env vars:
```ts
const PYODIDE_URL = import.meta.env.VITE_PYODIDE_URL ?? "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const WEBR_URL    = import.meta.env.VITE_WEBR_URL    ?? "https://webr.r-wasm.org/latest/webr.mjs";
```
Leave them unset and the app behaves exactly as before (CDN). Set them at
build time and the runtimes load from `public/`.

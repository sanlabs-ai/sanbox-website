# Sanbox Marketing Site

Standalone static marketing site for Sanbox. It intentionally stays separate from the authenticated React console under `../web` and the nested Sanlabs company site under `../sanlabs`.

## Preview locally

```bash
python3 -m http.server 4173 --directory website
```

Then open `http://127.0.0.1:4173`.

The source is plain HTML, CSS, JavaScript, and SVG. `npm run build` packages those assets into a small Cloudflare Worker-compatible entrypoint for deployment; the source directory can also be served directly by any static host.

## Product-status convention

The capability map and roadmap deliberately distinguish currently available foundations from features in development. Keep those labels accurate as the implementation evolves.

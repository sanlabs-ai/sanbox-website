import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist/server");

const files = [
  ["/", "index.html", "text/html; charset=utf-8"],
  ["/index.html", "index.html", "text/html; charset=utf-8"],
  ["/impressum", "impressum/index.html", "text/html; charset=utf-8"],
  ["/impressum/index.html", "impressum/index.html", "text/html; charset=utf-8"],
  ["/datenschutz", "datenschutz/index.html", "text/html; charset=utf-8"],
  ["/datenschutz/index.html", "datenschutz/index.html", "text/html; charset=utf-8"],
  ["/styles.css", "styles.css", "text/css; charset=utf-8"],
  ["/main.js", "main.js", "text/javascript; charset=utf-8"],
  ["/assets/favicon.svg", "assets/favicon.svg", "image/svg+xml; charset=utf-8"],
  ["/assets/sanlabs-symbol.svg", "assets/sanlabs-symbol.svg", "image/svg+xml; charset=utf-8"],
  ["/assets/opencode-wordmark.svg", "assets/opencode-wordmark.svg", "image/svg+xml; charset=utf-8"],
  ["/assets/og-image.svg", "assets/og-image.svg", "image/svg+xml; charset=utf-8"],
  ["/assets/og-image.png", "assets/og-image.png", "image/png", "base64"]
];

const assets = {};
for (const [pathname, filename, contentType, encoding = "utf8"] of files) {
  const source = await readFile(resolve(root, filename));
  const body = source.toString(encoding);
  assets[pathname] = {
    body,
    contentType,
    encoding,
    immutable: pathname.startsWith("/assets/")
  };
}

const worker = `const assets = ${JSON.stringify(assets)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.length > 1 ? url.pathname.replace(/\\\/$/, "") : url.pathname;
    const asset = assets[pathname];

    if (!asset) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    const body = asset.encoding === "base64"
      ? Uint8Array.from(atob(asset.body), (character) => character.charCodeAt(0))
      : asset.body;

    return new Response(request.method === "HEAD" ? null : body, {
      status: 200,
      headers: {
        "content-type": asset.contentType,
        "cache-control": asset.immutable ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin"
      }
    });
  }
};
`;

await rm(resolve(root, "dist"), { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(resolve(output, "index.js"), worker);
console.log(`Built ${Object.keys(assets).length} routes to dist/server/index.js`);

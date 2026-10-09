# DONECASH — Optional Reproduction Tools

The portal, documents, screenshots and prototype already work without installing tools. This directory exists only for maintainers who want to regenerate artifacts. It is not a NestJS/Next.js project.

## Install

Use a compatible Node.js release (Node 22+ recommended for the pinned tooling). From this directory, run `npm install` and `npx playwright install chromium`. Then run the scripts from the **delivery root**, not the tools directory.

```sh
node tools/render-final-design.mjs
node tools/build-presentation.mjs
node tools/capture-presentation.mjs
node tools/validate-delivery.mjs
```

The renderer rebuilds only this package's `design/final/` after validating the resolved path. It creates 14 presentation PNGs, 94 individual route captures, the English wireframe PNG and route manifest. Custom files placed in the generated final folder would be replaced; keep originals elsewhere.

`build-presentation.mjs` creates the offline portal, HTML versions of English Markdown documents and the file checksum manifest. `validate-delivery.mjs` checks local paths/language/coverage and opens routes in headless Chromium for navigation checks. They do not test an actual financial backend, native mobile app or complete accessibility.

After a validation run writes its report, run the presentation builder once more to update HTML and checksums, then run `node tools/validate-delivery.mjs --verify-only`. That final mode verifies checksums without modifying the report. `capture-presentation.mjs` adds preview images of the portal/document reader under `design/presentation/`.

In the authoring workspace, `DONECASH_NODE_MODULES` may point to an existing dependency directory. Normal recipients should install the pinned tools locally. No machine-specific dependency path is embedded in the delivered scripts.

## Documentation diagrams

Mermaid source diagrams remain editable in the Markdown. The offline HTML reader displays their source as code (not an online diagram service); use a Mermaid-capable Markdown editor for rendered interactive diagrams. No external CDN/font/network request is required by the presentation portal.

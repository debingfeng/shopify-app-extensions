import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = process.cwd();
const require = createRequire(import.meta.url);

function resolvePolarisBuildRoot() {
  const pkgPath = require.resolve("@shopify/polaris/package.json", {
    paths: [ROOT],
  });
  return path.join(path.dirname(pkgPath), "build");
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, contents) {
  fs.writeFileSync(filePath, contents, "utf8");
}

function patchFile(relativePath, transforms) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    return { filePath, status: "missing", changed: false };
  }

  const original = readFile(filePath);
  let next = original;

  for (const { find, replace } of transforms) {
    next = next.replace(find, replace);
  }

  if (next === original) {
    return { filePath, status: "unchanged", changed: false };
  }

  writeFile(filePath, next);
  return { filePath, status: "patched", changed: true };
}

const windowLikePropsTransforms = [
  // Avoid passing Window/Document objects via React props. React's dev-time
  // user-timing/props introspection can iterate enumerable Window fields like
  // `top`, causing cross-origin SecurityError in embedded Shopify iframes.
  {
    find: /\n\s*window:\s*window\s*/g,
    replace: "\n",
  },
  {
    find: /\n\s*document:\s*window\?\.\s*document\s*/g,
    replace: "\n",
  },
];

const positionedOverlayTransforms = [
  {
    find: /\n\s*window:\s*this\.overlay\?\.\s*ownerDocument\.\s*defaultView\s*/g,
    replace: "\n",
  },
];

const polarisBuildRoot = resolvePolarisBuildRoot();

const targets = [
  // PopoverOverlay
  {
    relativePath: "esm/components/Popover/components/PopoverOverlay/PopoverOverlay.js",
    transforms: windowLikePropsTransforms,
  },
  {
    relativePath: "cjs/components/Popover/components/PopoverOverlay/PopoverOverlay.js",
    transforms: windowLikePropsTransforms,
  },
  {
    relativePath: "esnext/components/Popover/components/PopoverOverlay/PopoverOverlay.esnext",
    transforms: windowLikePropsTransforms,
  },
  // ColorPicker Slidable
  {
    relativePath: "esm/components/ColorPicker/components/Slidable/Slidable.js",
    transforms: windowLikePropsTransforms,
  },
  {
    relativePath: "cjs/components/ColorPicker/components/Slidable/Slidable.js",
    transforms: windowLikePropsTransforms,
  },
  {
    relativePath: "esnext/components/ColorPicker/components/Slidable/Slidable.esnext",
    transforms: windowLikePropsTransforms,
  },
  // PositionedOverlay
  {
    relativePath: "esm/components/PositionedOverlay/PositionedOverlay.js",
    transforms: positionedOverlayTransforms,
  },
  {
    relativePath: "cjs/components/PositionedOverlay/PositionedOverlay.js",
    transforms: positionedOverlayTransforms,
  },
  {
    relativePath: "esnext/components/PositionedOverlay/PositionedOverlay.esnext",
    transforms: positionedOverlayTransforms,
  },
];

const results = targets.map((t) =>
  patchFile(path.relative(ROOT, path.join(polarisBuildRoot, t.relativePath)), t.transforms),
);
const patched = results.filter((r) => r.changed);
const missing = results.filter((r) => r.status === "missing");

if (patched.length === 0) {
  console.log("[patch-polaris] no changes (already patched or unexpected version)");
} else {
  console.log(`[patch-polaris] patched ${patched.length} file(s)`);
}

if (missing.length) {
  console.warn(
    `[patch-polaris] missing ${missing.length} target(s):\n` +
      missing.map((m) => `- ${m.filePath}`).join("\n"),
  );
}

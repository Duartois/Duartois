/**
 * verify-three-core-only
 *
 * CI guard: scans all source files and fails if any import uses
 * three/examples, three/addons, R3F or other banned Three.js add-on packages.
 *
 * Run: npm run verify:three  (also fires automatically in prebuild)
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["app", "components", "types"];
const ALLOWED_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const BANNED = [
  { pattern: /^three\/examples\//, label: "three/examples/*" },
  { pattern: /^three\/addons\//, label: "three/addons/*" },
  { pattern: /^three-stdlib(\b|\/)/, label: "three-stdlib" },
  { pattern: /^@react-three\//, label: "@react-three/*" },
  { pattern: /^troika-three-text(\b|\/)/, label: "troika-three-text" },
  { pattern: /^maath(\b|\/)/, label: "maath" },
  { pattern: /^postprocessing(\b|\/)/, label: "postprocessing" },
] as const;

type Violation = {
  file: string;
  line: number;
  specifier: string;
  label: string;
};

// ─── File walker ─────────────────────────────────────────────────────────────

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (
      entry.isFile() &&
      ALLOWED_EXTS.has(path.extname(entry.name)) &&
      !entry.name.endsWith(".d.ts")
    ) {
      files.push(full);
    }
  }

  return files;
}

// ─── Import extractor (TypeScript AST) ───────────────────────────────────────

function extractImportSpecifiers(
  filePath: string,
  source: string,
): Array<{ specifier: string; line: number }> {
  const kind = filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  const results: Array<{ specifier: string; line: number }> = [];

  const visit = (node: ts.Node) => {
    const specifier =
      ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
        ? node.moduleSpecifier
        : ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === "require" &&
            node.arguments[0]
          ? node.arguments[0]
          : null;

    if (specifier && ts.isStringLiteral(specifier)) {
      const line =
        sf.getLineAndCharacterOfPosition(specifier.getStart()).line + 1;
      results.push({ specifier: specifier.text, line });
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);
  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const files = (
    await Promise.all(
      SCAN_DIRS.map((d) => walk(path.join(ROOT, d)).catch(() => [])),
    )
  ).flat();

  const violations: Violation[] = [];

  await Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, "utf-8");
      const imports = extractImportSpecifiers(file, source);

      for (const { specifier, line } of imports) {
        for (const { pattern, label } of BANNED) {
          if (pattern.test(specifier)) {
            violations.push({
              file: path.relative(ROOT, file),
              line,
              specifier,
              label,
            });
          }
        }
      }
    }),
  );

  if (violations.length === 0) {
    console.log("✅ verify-three-core-only: no banned imports found.");
    return;
  }

  console.error(
    `\n❌ verify-three-core-only: ${violations.length} violation(s) found:\n`,
  );

  for (const { file, line, specifier, label } of violations) {
    console.error(`  ${file}:${line}  →  "${specifier}"  (${label})`);
  }

  console.error(
    "\nOnly 'three' core is allowed. Remove the imports above and run again.\n",
  );

  process.exit(1);
}

main().catch((err) => {
  console.error("verify-three-core-only crashed:", err);
  process.exit(1);
});

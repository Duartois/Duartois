import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const rootDir = path.resolve(__dirname, "..");
const directoriesToScan = ["app", "components", "types"];
const allowedExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

const bannedPackages = [
  {
    pattern: /^three\/examples\//,
    description: "three/examples modules",
  },
  {
    pattern: /^three\/addons\//,
    description: "three/addons modules",
  },
  {
    pattern: /^three-stdlib(\b|\/)/,
    description: "three-stdlib package",
  },
  {
    pattern: /^@react-three\//,
    description: "@react-three packages",
  },
  {
    pattern: /^troika-three-text(\b|\/)/,
    description: "troika-three-text package",
  },
  {
    pattern: /^maath(\b|\/)/,
    description: "maath package",
  },
  {
    pattern: /^postprocessing(\b|\/)/,
    description: "postprocessing package",
  },
];

type Violation = {
  file: string;
  line: number;
  specifier: string;
  description: string;
};

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules") {
        continue;
      }
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!allowedExtensions.has(ext)) {
        continue;
      }
      if (entry.name.endsWith(".d.ts")) {
        continue;
      }
      files.push(fullPath);
    }
  }

  return files;
}

function extractSpecifiers(
  filePath: string,
  content: string
): Array<{ specifier: string; index: number }> {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : undefined
  );

  const specifiers: Array<{ specifier: string; index: number }> = [];

  const record = (specifier: string, node: ts.Node) => {
    specifiers.push({ specifier, index: node.getStart(sourceFile) });
  };

  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      record(node.moduleSpecifier.text, node.moduleSpecifier);
    } else if (ts.isCallExpression(node)) {
      const [firstArg] = node.arguments;
      if (firstArg && ts.isStringLiteralLike(firstArg)) {
        if (ts.isIdentifier(node.expression) && node.expression.text === "require") {
          record(firstArg.text, firstArg);
        } else if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          record(firstArg.text, firstArg);
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return specifiers;
}

function checkSpecifier(specifier: string): { description: string } | null {
  for (const { pattern, description } of bannedPackages) {
    if (pattern.test(specifier)) {
      return { description };
    }
  }
  return null;
}

function computeLine(content: string, index: number): number {
  return content.slice(0, index).split(/\r?\n/).length;
}

async function verify(): Promise<Violation[]> {
  const filesToCheck = await Promise.all(
    directoriesToScan.map(async (relativeDir) => {
      const absoluteDir = path.join(rootDir, relativeDir);
      try {
        return await walk(absoluteDir);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return [];
        }
        throw error;
      }
    })
  );

  const flattened = filesToCheck.flat();
  const violations: Violation[] = [];

  for (const filePath of flattened) {
    const content = await readFile(filePath, "utf8");

    for (const { specifier, index } of extractSpecifiers(filePath, content)) {
      const cleanedSpecifier = specifier.split("?", 1)[0];
      const violation = checkSpecifier(cleanedSpecifier);
      if (violation) {
        violations.push({
          file: path.relative(rootDir, filePath),
          line: computeLine(content, index),
          specifier,
          description: violation.description,
        });
      }
    }
  }

  return violations;
}

(async () => {
  const violations = await verify();

  if (violations.length > 0) {
    console.error("Found forbidden Three.js imports:\n");
    for (const violation of violations) {
      console.error(
        ` - ${violation.file}:${violation.line} imports \"${violation.specifier}\" (${violation.description})`
      );
    }
    console.error("\nPlease remove these imports or replace them with core three modules.");
    process.exitCode = 1;
    return;
  }

  console.log("✅ Three.js core-only verification passed.");
})();

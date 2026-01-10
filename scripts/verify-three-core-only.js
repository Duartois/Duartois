const { readdir, readFile } = require("node:fs/promises");
const path = require("node:path");

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

const staticImportRegex =
  /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const bareImportRegex = /\bimport\s+['"]([^'"]+)['"]/g;
const requireRegex = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const dynamicImportRegex = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

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

function extractSpecifiers(content) {
  const specifiers = [];
  const record = (specifier, index) => {
    specifiers.push({ specifier, index });
  };

  const patterns = [
    staticImportRegex,
    bareImportRegex,
    requireRegex,
    dynamicImportRegex,
  ];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match = pattern.exec(content);
    while (match) {
      record(match[1], match.index);
      match = pattern.exec(content);
    }
  }

  return specifiers;
}

function checkSpecifier(specifier) {
  for (const { pattern, description } of bannedPackages) {
    if (pattern.test(specifier)) {
      return { description };
    }
  }
  return null;
}

function computeLine(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

async function verify() {
  const filesToCheck = await Promise.all(
    directoriesToScan.map(async (relativeDir) => {
      const absoluteDir = path.join(rootDir, relativeDir);
      try {
        return await walk(absoluteDir);
      } catch (error) {
        if (error && error.code === "ENOENT") {
          return [];
        }
        throw error;
      }
    })
  );

  const flattened = filesToCheck.flat();
  const violations = [];

  for (const filePath of flattened) {
    const content = await readFile(filePath, "utf8");

    for (const { specifier, index } of extractSpecifiers(content)) {
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

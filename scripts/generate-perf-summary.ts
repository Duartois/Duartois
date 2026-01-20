import fs from "fs";
import path from "path";

type BundleSummary = {
  generatedAt: string;
  routes: Record<string, number | null>;
};

const ROOT = process.cwd();
const NEXT_DIR = path.join(ROOT, ".next");
const REPORT_DIR = path.join(ROOT, "reports");
const ROUTES = ["/", "/work", "/work/[slug]", "/about", "/contact"];

const readJson = <T>(filePath: string): T | null => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
};

const statSize = (filePath: string) => {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
};

const resolveChunkPath = (entry: string) => {
  if (entry.startsWith("/")) {
    return path.join(ROOT, entry);
  }
  return path.join(NEXT_DIR, entry);
};

const uniqueFiles = (files: string[]) => Array.from(new Set(files));

const buildManifest = readJson<{ pages: Record<string, string[]> }>(
  path.join(NEXT_DIR, "build-manifest.json"),
);
const appBuildManifest = readJson<{ pages: Record<string, string[]> }>(
  path.join(NEXT_DIR, "app-build-manifest.json"),
);

const getRouteFiles = (route: string) => {
  const appFiles = appBuildManifest?.pages?.[route] ?? [];
  const pagesFiles = buildManifest?.pages?.[route] ?? [];
  return uniqueFiles([...appFiles, ...pagesFiles]);
};

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const summary: BundleSummary = {
  generatedAt: new Date().toISOString(),
  routes: {},
};

ROUTES.forEach((route) => {
  const files = getRouteFiles(route);

  if (files.length === 0) {
    summary.routes[route] = null;
    return;
  }

  const total = files.reduce((sum, file) => {
    const resolvedPath = resolveChunkPath(file);
    return sum + statSize(resolvedPath);
  }, 0);

  summary.routes[route] = total;
});

const summaryPath = path.join(REPORT_DIR, "bundle-summary.json");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

const baselinePath = path.join(REPORT_DIR, "perf-baseline.json");
const baseline = readJson<BundleSummary>(baselinePath);

const formatBytes = (bytes: number | null) => {
  if (bytes === null) {
    return "N/A";
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const reportLines = [
  "# Performance Summary",
  "",
  `Generated at: ${summary.generatedAt}`,
  "",
  "## Initial JS by route (from build manifests)",
  "",
  "| Route | Before | After |",
  "| --- | --- | --- |",
  ...ROUTES.map((route) => {
    const before = baseline?.routes?.[route] ?? null;
    const after = summary.routes[route];
    return `| ${route} | ${formatBytes(before)} | ${formatBytes(after)} |`;
  }),
  "",
  "## First render request/image summary",
  "- Collect with `NEXT_PUBLIC_PERF_DEBUG=true` and capture the console output for each route.",
  "",
  "## Key changes",
  "- Document performance-focused changes here when updating the report manually.",
  "",
  "## How to measure",
  "- `npm run perf:report` to regenerate this file from build artifacts.",
  "- `PERF_BASELINE=true npm run perf:report` to capture a baseline on a previous commit.",
  "- `NEXT_PUBLIC_PERF_DEBUG=true npm run dev` to log FCP, 3D init timing, and image counts.",
  "",
  "## Notes",
  "- `Before` values are populated when `reports/perf-baseline.json` exists.",
  "- Run `PERF_BASELINE=true npm run perf:report` on a baseline commit to generate it.",
  "",
  "## Image/request summary",
  "- Use `NEXT_PUBLIC_PERF_DEBUG=true` while browsing to log per-route image counts and bytes in the console.",
];

fs.writeFileSync(
  path.join(REPORT_DIR, "perf-summary.md"),
  reportLines.join("\n"),
);

if (process.env.PERF_BASELINE === "true") {
  fs.writeFileSync(baselinePath, JSON.stringify(summary, null, 2));
}

console.log(`Bundle summary written to ${summaryPath}`);

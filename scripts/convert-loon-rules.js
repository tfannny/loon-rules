#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const SUPPORTED_RULE_TYPES = new Set([
  "DOMAIN",
  "DOMAIN-SUFFIX",
  "DOMAIN-KEYWORD",
  "DOMAIN-WILDCARD",
  "IP-CIDR",
  "IP-CIDR6",
  "GEOIP",
  "USER-AGENT",
  "URL-REGEX",
  "PROCESS-NAME",
  "DEST-PORT",
  "SRC-IP",
  "SRC-PORT",
]);

function formatTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day} ${byType.hour}:${byType.minute}:${byType.second}`;
}

function stripYamlListSyntax(line) {
  let value = line.trim();
  if (value === "payload:" || value === "---") return "";
  if (value.startsWith("- ")) value = value.slice(2).trim();
  if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  return value.trim();
}

function isIpv4Cidr(value) {
  return /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(value);
}

function isIpv6Cidr(value) {
  return /^[0-9a-fA-F:]+\/\d{1,3}$/.test(value) && value.includes(":");
}

function hasWhitespace(value) {
  return /\s/.test(value);
}

function normalizeClassicalRule(value) {
  const pieces = value.split(",").map((part) => part.trim());
  const type = pieces[0]?.toUpperCase();

  if (!SUPPORTED_RULE_TYPES.has(type) || pieces.length < 2 || pieces[1] === "") {
    return null;
  }

  if ((type === "IP-CIDR" || type === "IP-CIDR6") && pieces.length === 2) {
    pieces.push("no-resolve");
  }

  return {
    type,
    line: [type, ...pieces.slice(1)].join(","),
  };
}

function normalizePayloadRule(value, fileName) {
  if (value.includes(",")) {
    const classical = normalizeClassicalRule(value);
    if (classical) return classical;
  }

  if (hasWhitespace(value)) {
    return null;
  }

  if (isIpv4Cidr(value)) {
    return {
      type: "IP-CIDR",
      line: `IP-CIDR,${value},no-resolve`,
    };
  }

  if (isIpv6Cidr(value)) {
    return {
      type: "IP-CIDR6",
      line: `IP-CIDR6,${value},no-resolve`,
    };
  }

  if (fileName === "applications.txt") {
    return {
      type: "PROCESS-NAME",
      line: `PROCESS-NAME,${value}`,
    };
  }

  const domain = value.replace(/^\+\./, "").replace(/^\./, "");
  if (!domain || domain.includes("/")) {
    return null;
  }

  return {
    type: "DOMAIN-SUFFIX",
    line: `DOMAIN-SUFFIX,${domain}`,
  };
}

function convertContent({ fileName, sourceUrl, updatedAt = formatTimestamp(), content }) {
  const name = path.basename(fileName, path.extname(fileName));
  const counts = new Map();
  const outputRules = [];
  const seen = new Set();

  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed === "payload:" || trimmed === "---") continue;
    if (trimmed.startsWith("#")) continue;

    const value = stripYamlListSyntax(trimmed);
    if (!value) continue;

    const normalized = normalizePayloadRule(value, fileName);
    if (!normalized) {
      throw new Error(`${fileName}:${index + 1}: Unrecognized rule line: ${rawLine}`);
    }

    if (seen.has(normalized.line)) continue;
    seen.add(normalized.line);
    outputRules.push(normalized.line);
    counts.set(normalized.type, (counts.get(normalized.type) || 0) + 1);
  }

  const header = [
    `# NAME: ${name}`,
    "# AUTHOR: Loyalsoldier/clash-rules converted for Loon",
    "# REPO: https://github.com/Loyalsoldier/clash-rules",
    sourceUrl ? `# SOURCE: ${sourceUrl}` : null,
    `# UPDATED: ${updatedAt}`,
    ...Array.from(counts.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([type, count]) => `# ${type}: ${count}`),
    `# TOTAL: ${outputRules.length}`,
  ].filter(Boolean);

  return `${header.join("\n")}\n${outputRules.join("\n")}\n`;
}

function listTxtFiles(inputDir) {
  return fs
    .readdirSync(inputDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function convertDirectory({ inputDir, outputDir, sourceBaseUrl, updatedAt = formatTimestamp() }) {
  fs.mkdirSync(outputDir, { recursive: true });

  const files = listTxtFiles(inputDir);
  const summary = [];

  for (const fileName of files) {
    const inputPath = path.join(inputDir, fileName);
    const outputName = `${path.basename(fileName, ".txt")}.list`;
    const outputPath = path.join(outputDir, outputName);
    const sourceUrl = sourceBaseUrl ? `${sourceBaseUrl.replace(/\/$/, "")}/${fileName}` : "";
    const content = fs.readFileSync(inputPath, "utf8");
    const converted = convertContent({ fileName, sourceUrl, updatedAt, content });

    fs.writeFileSync(outputPath, converted);
    summary.push({
      input: fileName,
      output: outputName,
      rules: converted
        .split(/\r?\n/)
        .filter((line) => line && !line.startsWith("#")).length,
    });
  }

  return summary;
}

function parseArgs(argv) {
  const options = {
    inputDir: "upstream",
    outputDir: "dist/loon-rules",
    sourceBaseUrl: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release",
    metadataPath: "dist/metadata.json",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--input") {
      options.inputDir = next;
      index += 1;
    } else if (arg === "--output") {
      options.outputDir = next;
      index += 1;
    } else if (arg === "--source-base-url") {
      options.sourceBaseUrl = next;
      index += 1;
    } else if (arg === "--metadata") {
      options.metadataPath = next;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const updatedAt = formatTimestamp();
  const summary = convertDirectory({ ...options, updatedAt });
  const totalRules = summary.reduce((total, item) => total + item.rules, 0);

  fs.mkdirSync(path.dirname(options.metadataPath), { recursive: true });
  fs.writeFileSync(
    options.metadataPath,
    `${JSON.stringify({ updatedAt, fileCount: summary.length, totalRules, files: summary }, null, 2)}\n`,
  );

  console.log(`Converted ${summary.length} file(s), ${totalRules} rule(s).`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.stack || error.message);
    process.exit(1);
  }
}

module.exports = {
  convertContent,
  convertDirectory,
  formatTimestamp,
};

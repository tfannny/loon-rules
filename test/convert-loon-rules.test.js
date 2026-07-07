const assert = require("node:assert/strict");
const test = require("node:test");

const { convertContent } = require("../scripts/convert-loon-rules");

test("converts yaml payload domains to Loon DOMAIN-SUFFIX rules", () => {
  const output = convertContent({
    fileName: "direct.txt",
    sourceUrl: "https://example.test/direct.txt",
    updatedAt: "2026-07-07 08:00:00",
    content: [
      "payload:",
      "  - 'example.com'",
      "  - \"+.example.org\"",
      "  - DOMAIN,exact.example.net",
      "",
    ].join("\n"),
  });

  assert.match(output, /# NAME: direct/);
  assert.match(output, /# DOMAIN: 1/);
  assert.match(output, /# DOMAIN-SUFFIX: 2/);
  assert.match(output, /# TOTAL: 3/);
  assert.match(output, /^DOMAIN-SUFFIX,example\.com$/m);
  assert.match(output, /^DOMAIN-SUFFIX,example\.org$/m);
  assert.match(output, /^DOMAIN,exact\.example\.net$/m);
});

test("detects CIDR entries and keeps no-resolve suffix when already present", () => {
  const output = convertContent({
    fileName: "telegramcidr.txt",
    sourceUrl: "https://example.test/telegramcidr.txt",
    updatedAt: "2026-07-07 08:00:00",
    content: [
      "payload:",
      "  - '91.108.4.0/22'",
      "  - '2001:67c:4e8::/48'",
      "  - IP-CIDR,149.154.160.0/20,no-resolve",
    ].join("\n"),
  });

  assert.match(output, /# IP-CIDR: 2/);
  assert.match(output, /# IP-CIDR6: 1/);
  assert.match(output, /^IP-CIDR,91\.108\.4\.0\/22,no-resolve$/m);
  assert.match(output, /^IP-CIDR6,2001:67c:4e8::\/48,no-resolve$/m);
  assert.match(output, /^IP-CIDR,149\.154\.160\.0\/20,no-resolve$/m);
});

test("treats applications.txt bare values as process names", () => {
  const output = convertContent({
    fileName: "applications.txt",
    sourceUrl: "https://example.test/applications.txt",
    updatedAt: "2026-07-07 08:00:00",
    content: ["payload:", "  - aria2c", "  - BitComet.exe"].join("\n"),
  });

  assert.match(output, /# PROCESS-NAME: 2/);
  assert.match(output, /^PROCESS-NAME,aria2c$/m);
  assert.match(output, /^PROCESS-NAME,BitComet\.exe$/m);
});

test("throws on unrecognized lines so broken input is not silently published", () => {
  assert.throws(
    () =>
      convertContent({
        fileName: "direct.txt",
        sourceUrl: "https://example.test/direct.txt",
        updatedAt: "2026-07-07 08:00:00",
        content: ["payload:", "  - 'bad rule with spaces'"].join("\n"),
      }),
    /Unrecognized rule line/,
  );
});

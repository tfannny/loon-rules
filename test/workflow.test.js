const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const workflow = fs.readFileSync(".github/workflows/build-loon-rules.yml", "utf8");

test("latest release creation lets gh create the tag from the workflow commit", () => {
  assert.match(workflow, /gh release create "\$tag"[\s\S]*--target "\$GITHUB_SHA"/);
});

test("latest release publishing does not manually push a local latest tag first", () => {
  assert.doesNotMatch(workflow, /git push origin "\$tag"/);
});

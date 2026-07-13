const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const workflow = fs.readFileSync(".github/workflows/build-loon-rules.yml", "utf8");

test("release branch publishing exposes the generated release commit", () => {
  assert.match(workflow, /id: release_branch/);
  assert.match(workflow, /echo "commit=\$\(git rev-parse HEAD\)" >> "\$GITHUB_OUTPUT"/);
});

test("latest release creation targets the generated release branch commit", () => {
  assert.match(
    workflow,
    /gh release create "\$tag"[\s\S]*--target "\$\{\{ steps\.release_branch\.outputs\.commit \}\}"/,
  );
});

test("latest release publishing does not manually push a local latest tag first", () => {
  assert.doesNotMatch(workflow, /git push origin "\$tag"/);
});

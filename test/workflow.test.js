const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const workflow = fs.readFileSync(".github/workflows/build-loon-rules.yml", "utf8");

test("release branch publishing exposes the generated release commit", () => {
  assert.match(workflow, /id: release_branch/);
  assert.match(workflow, /echo "commit=\$\(git rev-parse HEAD\)" >> "\$GITHUB_OUTPUT"/);
});

test("latest release publishing uses the generated release branch commit", () => {
  assert.match(workflow, /release_commit="\$\{\{ steps\.release_branch\.outputs\.commit \}\}"/);
  assert.match(workflow, /git -C release-branch tag -f "\$tag" "\$release_commit"/);
  assert.match(workflow, /git -C release-branch push --force origin "refs\/tags\/\$\{tag\}"/);
});

test("latest release title uses the current Beijing date", () => {
  assert.match(workflow, /RELEASE_DATE=\$\(TZ=Asia\/Shanghai date \+%Y%m%d\)/);
  assert.match(workflow, /--title "Loon Rules Latest \(\$\{RELEASE_DATE\}\)"/);
});

test("latest release publishing updates existing releases in place", () => {
  assert.match(workflow, /if gh release view "\$tag" >\/dev\/null 2>&1; then/);
  assert.match(workflow, /gh release edit "\$tag"[\s\S]*--target "\$release_commit"/);
  assert.match(workflow, /gh release upload "\$tag" "\$\{assets\[@\]\}" --clobber/);
  assert.match(workflow, /else[\s\S]*gh release create "\$tag" "\$\{assets\[@\]\}"/);
});

test("latest release publishing does not delete the release or remote tag", () => {
  assert.doesNotMatch(workflow, /gh release delete/);
  assert.doesNotMatch(workflow, /git push origin ":refs\/tags\/\$\{tag\}"/);
});

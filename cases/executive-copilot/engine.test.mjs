import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, scenarios } from "./engine.mjs";

const run = (id) => analyze(scenarios.find((scenario) => scenario.id === id).query, id);

test("routes the three presets and resolves every citation to a source in the scenario", () => {
  const expectedRoutes = ["Briefing", "Commitments", "Strategic questions"];
  for (const [index, scenario] of scenarios.entries()) {
    const result = run(scenario.id);
    assert.equal(result.trace[0].detail, expectedRoutes[index]);
    const available = new Set(scenario.documents.map(({ id }) => id));
    const attached = new Set(result.sources.map(({ id }) => id));
    for (const id of attached) assert.ok(available.has(id));
    for (const entry of [...result.briefing, ...result.commitments, ...result.questions, ...result.conflicts]) {
      assert.ok(entry.sourceIds.every((id) => attached.has(id)));
    }
    assert.deepEqual(result, run(scenario.id));
  }
});

test("uses a release condition for sufficient evidence and preserves gaps in the missing packet", () => {
  const ready = run("sufficient");
  assert.match(ready.briefing[0].text, /supports preparing the pilot for launch/i);
  assert.ok(ready.briefing[0].sourceIds.length > 0);
  const missing = run("missing");
  assert.match(missing.briefing[0].text, /preparation only/i);
  assert.ok(missing.commitments.some(({ owner, due }) => owner === null && due === null));
  assert.ok(missing.questions.length > 0);
});

test("keeps a disputed launch date out of the brief and a disputed due date unconfirmed", () => {
  const result = run("conflict");
  assert.match(result.briefing[0].text, /cannot support a public announcement/i);
  assert.ok(result.conflicts.some(({ sourceIds }) => sourceIds.includes("OPS-21") && sourceIds.includes("COM-22")));
  assert.ok(!result.briefing.some(({ text }) => /14–18 June|21–25 June/.test(text)));
  assert.equal(result.commitments.find(({ action }) => /resident invitation/i.test(action))?.due, null);
});

test("retrieves a concept-only match and abstains when no evidence matches", () => {
  const semantic = analyze("wheelchair accommodations", "sufficient");
  assert.ok(semantic.sources.some(({ id, lexical, concept }) => id === "COM-04" && lexical === 0 && concept > 0));
  const unrelated = analyze("How does photosynthesis work?", "sufficient");
  assert.deepEqual(unrelated.sources, []);
  assert.deepEqual(unrelated.commitments, []);
  assert.match(unrelated.briefing[0].text, /does not support an answer/i);
});

import test from "node:test";
import assert from "node:assert/strict";
import { createRngState, random, runWithRng, shuffleRandom, snapshotRng } from "../engine/random.mjs";

function sequence(seed, count = 8) {
  return runWithRng(createRngState(seed), () => Array.from({ length: count }, () => random())).value;
}

test("same seed creates the same sequence", () => {
  assert.deepEqual(sequence("EOU-TEST"), sequence("EOU-TEST"));
});

test("different seeds create different sequences", () => {
  assert.notDeepEqual(sequence("EOU-A"), sequence("EOU-B"));
});

test("saved RNG state resumes exactly", () => {
  const first = runWithRng(createRngState("EOU-RESUME"), () => {
    const values = [random(), random(), random()];
    return { values, checkpoint: snapshotRng() };
  }).value;
  const continuationA = runWithRng(first.checkpoint, () => [random(), random(), random()]).value;
  const continuationB = runWithRng(first.checkpoint, () => [random(), random(), random()]).value;
  assert.deepEqual(continuationA, continuationB);
});

test("shuffle is deterministic and preserves members", () => {
  const input = [1, 2, 3, 4, 5, 6];
  const a = runWithRng(createRngState("EOU-SHUFFLE"), () => shuffleRandom(input)).value;
  const b = runWithRng(createRngState("EOU-SHUFFLE"), () => shuffleRandom(input)).value;
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort((x, y) => x - y), input);
});

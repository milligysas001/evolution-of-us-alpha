import { createRngState, normalizeRngState, runWithRng } from "./random.mjs";

/** Runs a game transition with the save's deterministic random state. */
export function runSeededTransition(game, transition) {
  const fallbackSeed = `${game?.houseName || "House"}-${game?.leaderName || "Leader"}-${game?.year || 1}-${game?.month || 1}`;
  const initialRng = normalizeRngState(game?.rng, fallbackSeed);
  const { value, rng } = runWithRng(initialRng, () => transition(game));
  return { ...value, rng };
}

/** Creates an initial game in a deterministic random context. */
export function createSeededGame(seed, factory) {
  const initialRng = createRngState(seed);
  const { value, rng } = runWithRng(initialRng, factory);
  return { ...value, rng };
}

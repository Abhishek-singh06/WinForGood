/**
 * =============================================================================
 * DIGITAL HEROES — Phase 5: Production Draw Execution Strategies
 * PRD Reference: § 06 (Draw & Reward System)
 * Business Decision #2: BR-048 / A-011 (RESOLVED)
 * =============================================================================
 *
 * MODES:
 * 1. Random: Standard lottery draw. 5 distinct integers drawn uniformly
 *    without replacement from {1..45}.
 *
 * 2. Algorithmic: Weighted by score frequency across current cycle participants.
 *    - Formula: W(n) = f(n) + 1 (Laplace smoothing).
 *    - Any number with f(n) = 0 maintains baseline weight = 1 (no starvation).
 *    - Sequential weighted sampling without replacement across 5 steps.
 *    - Dynamic renormalization of remaining candidate weights after each step.
 *    - Supports deterministic PRNG seeding for audited testing/reproducibility.
 */

import {
  DrawGenerationContext,
  DrawMode,
  IDrawExecutionStrategy,
} from "./types";

/**
 * High-quality deterministic 32-bit pseudo-random number generator (Mulberry32).
 * Converts an arbitrary string seed into reproducible pseudo-random numbers in [0, 1).
 */
export function createSeededRng(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  let s = h >>> 0;
  return function mulberry32(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a secure random float in [0, 1) using crypto when no seed is provided.
 */
function getSecureRandom(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  }
  return Math.random();
}

/**
 * RANDOM DRAW STRATEGY (PRD § 06)
 * Uniform sampling of 5 distinct integers from {1..45} without replacement.
 */
export class RandomDrawStrategy implements IDrawExecutionStrategy {
  public readonly mode: DrawMode = "random";

  public async generateWinningNumbers(
    context: DrawGenerationContext
  ): Promise<number[]> {
    const rng = context.randomSeed
      ? createSeededRng(context.randomSeed)
      : getSecureRandom;

    // Available candidate pool: 1 to 45
    const pool: number[] = Array.from({ length: 45 }, (_, i) => i + 1);
    const selected: number[] = [];

    for (let step = 0; step < 5; step++) {
      const idx = Math.floor(rng() * pool.length);
      const chosen = pool.splice(idx, 1)[0];
      selected.push(chosen);
    }

    // Return sorted ascending for canonical format
    return selected.sort((a, b) => a - b);
  }
}

/**
 * ALGORITHMIC DRAW STRATEGY (PRD § 06, Decision #2, BR-048)
 * Sequential weighted sampling without replacement with Laplace smoothing W(n) = f(n) + 1.
 */
export class AlgorithmicDrawStrategy implements IDrawExecutionStrategy {
  public readonly mode: DrawMode = "algorithmic";

  /**
   * Helper to build a frequency distribution map from a collection of participant tickets.
   */
  public static buildFrequencyDistribution(tickets: number[][]): Record<number, number> {
    const dist: Record<number, number> = {};
    for (let n = 1; n <= 45; n++) {
      dist[n] = 0;
    }
    for (const ticket of tickets) {
      for (const score of ticket) {
        if (score >= 1 && score <= 45) {
          dist[score] = (dist[score] || 0) + 1;
        }
      }
    }
    return dist;
  }

  public async generateWinningNumbers(
    context: DrawGenerationContext
  ): Promise<number[]> {
    const rng = context.randomSeed
      ? createSeededRng(context.randomSeed)
      : getSecureRandom;

    const freqDist = context.frequencyDistribution || {};

    // Build candidate pool with smoothed weights: W(n) = f(n) + 1
    const candidates: Array<{ number: number; weight: number }> = [];
    for (let n = 1; n <= 45; n++) {
      const f = freqDist[n] || 0;
      candidates.push({ number: n, weight: f + 1 });
    }

    const selected: number[] = [];

    // Draw 5 distinct numbers sequentially without replacement
    for (let step = 0; step < 5; step++) {
      const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
      const target = rng() * totalWeight;

      let cumulative = 0;
      let selectedIdx = -1;

      for (let i = 0; i < candidates.length; i++) {
        cumulative += candidates[i].weight;
        if (target < cumulative || i === candidates.length - 1) {
          selectedIdx = i;
          break;
        }
      }

      const chosen = candidates.splice(selectedIdx, 1)[0];
      selected.push(chosen.number);
    }

    return selected.sort((a, b) => a - b);
  }
}

/**
 * Registry/factory to obtain the execution strategy matching the requested draw mode.
 */
export function getDrawStrategy(mode: DrawMode): IDrawExecutionStrategy {
  if (mode === "algorithmic") {
    return new AlgorithmicDrawStrategy();
  }
  return new RandomDrawStrategy();
}

/**
 * EXERCISE 5 — Async utilities (~15 min)
 *
 * MeetsMore's backend calls external APIs that sometimes fail. Implement
 * three helpers that every TypeScript backend eventually needs.
 *
 * Skills: Promise, async/await, generics, `unknown` in catch, setTimeout,
 *         Promise.race, keeping result ORDER while running in parallel.
 */

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * A) Call `fn` up to `attempts` times. Wait `delayMs` between attempts.
 *    Resolve with the first success; if every attempt fails, throw the LAST error.
 *    `attempts` must be >= 1.
 */
export async function retry<T>(fn: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  if (attempts < 1) throw new Error("attempts must be >= 1");
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await sleep(delayMs);
    }
  }
  throw lastError;
}

/**
 * B) Like Promise.all(items.map(fn)), but at most `limit` calls run at once.
 *    Results must be in the same order as `items`.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (limit < 1) throw new Error("limit must be >= 1");
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index] as T, index);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * C) Reject with Error("timeout") if `promise` has not settled within `ms`.
 *    Make sure the timer does not keep the process alive after `promise` settles.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// ---------------------------------------------------------------------------
// Test helpers (given) — a fake API that fails N times, then succeeds
// ---------------------------------------------------------------------------
export function createFlakyApi(failuresBeforeSuccess: number) {
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    async fetch(): Promise<string> {
      calls++;
      if (calls <= failuresBeforeSuccess) throw new Error(`fail #${calls}`);
      return "ok";
    },
  };
}

// ---------------------------------------------------------------------------
// Tests — run with: npx tsx <this file>
// ---------------------------------------------------------------------------
import assert from "node:assert/strict";

let failed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log("✓", name);
  } catch (e) {
    failed++;
    console.log("✗", name, "\n   ", (e as Error).message.split("\n")[0]);
  }
}

await test("A: retry succeeds after failures", async () => {
  const api = createFlakyApi(2);
  assert.equal(await retry(() => api.fetch(), 3, 1), "ok");
  assert.equal(api.calls, 3);
});

await test("A: retry throws the last error when attempts run out", async () => {
  const api = createFlakyApi(5);
  await assert.rejects(retry(() => api.fetch(), 3, 1), { message: "fail #3" });
  assert.equal(api.calls, 3);
  await assert.rejects(retry(() => api.fetch(), 0, 1));
});

await test("B: mapWithConcurrency keeps order and respects the limit", async () => {
  let running = 0;
  let maxRunning = 0;
  const items = [50, 10, 30, 20, 40, 5];
  const results = await mapWithConcurrency(items, 2, async (ms, index) => {
    running++;
    maxRunning = Math.max(maxRunning, running);
    await sleep(ms);
    running--;
    return `${index}:${ms}`;
  });
  assert.deepEqual(results, ["0:50", "1:10", "2:30", "3:20", "4:40", "5:5"]);
  assert.equal(maxRunning, 2);
});

await test("B: mapWithConcurrency edge cases", async () => {
  assert.deepEqual(await mapWithConcurrency([], 3, async (x: number) => x), []);
  assert.deepEqual(await mapWithConcurrency([1, 2], 10, async (x) => x * 2), [2, 4]);
  await assert.rejects(mapWithConcurrency([1, 2, 3], 2, async (x) => {
    if (x === 2) throw new Error("boom");
    return x;
  }));
});

await test("C: withTimeout", async () => {
  assert.equal(await withTimeout(sleep(5).then(() => "fast"), 100), "fast");
  await assert.rejects(withTimeout(sleep(100), 5), { message: "timeout" });
});

if (failed) process.exitCode = 1;

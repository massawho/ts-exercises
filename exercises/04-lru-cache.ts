/**
 * EXERCISE 4 — LRU cache + memoize (~15 min)
 *
 * Implement a Least-Recently-Used cache: when full, inserting a NEW key
 * evicts the key that was least recently READ or WRITTEN.
 *
 * Hint: a JS Map remembers insertion order; deleting and re-inserting a key
 * moves it to the end. `map.keys().next().value` is the oldest key.
 *
 * Skills: classes, generics, Map, getters, closures, rest parameters.
 *
 * Run:  npx tsx exercises/04-lru-cache.ts
 */

export class LRUCache<K, V> {
  // TODO: add private fields

  constructor(capacity: number) {
    // TODO: throw an Error if capacity is not a positive integer
    throw new Error("TODO");
  }

  /** Returns the value and marks the key as most recently used. */
  get(key: K): V | undefined {
    throw new Error("TODO");
  }

  /** Inserts or updates. Updating an existing key also marks it most recent. */
  set(key: K, value: V): void {
    throw new Error("TODO");
  }

  /** Does NOT change recency. */
  has(key: K): boolean {
    throw new Error("TODO");
  }

  get size(): number {
    throw new Error("TODO");
  }

  /** Keys from least recently used to most recently used. */
  keys(): K[] {
    throw new Error("TODO");
  }
}

/**
 * B) memoize: wrap `fn` so repeated calls with the same arguments return the
 *    cached result instead of calling `fn` again. Use an LRUCache with the
 *    given capacity and JSON.stringify(args) as the key.
 */
export function memoize<A extends unknown[], R>(fn: (...args: A) => R, capacity: number): (...args: A) => R {
  throw new Error("TODO");
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

await test("A: get/set basics", () => {
  const cache = new LRUCache<string, number>(2);
  cache.set("a", 1);
  cache.set("b", 2);
  assert.equal(cache.get("a"), 1);
  assert.equal(cache.get("missing"), undefined);
  assert.equal(cache.size, 2);
});

await test("A: evicts least recently used (get counts as use)", () => {
  const cache = new LRUCache<string, number>(2);
  cache.set("a", 1);
  cache.set("b", 2);
  cache.get("a"); // a is now most recent
  cache.set("c", 3); // evicts b
  assert.equal(cache.has("b"), false);
  assert.deepEqual(cache.keys(), ["a", "c"]);
});

await test("A: updating an existing key refreshes it, does not evict", () => {
  const cache = new LRUCache<string, number>(2);
  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("a", 10); // update, a becomes most recent
  assert.equal(cache.size, 2);
  assert.deepEqual(cache.keys(), ["b", "a"]);
  cache.set("c", 3); // evicts b
  assert.deepEqual(cache.keys(), ["a", "c"]);
  assert.equal(cache.get("a"), 10);
});

await test("A: has() does not change recency; invalid capacity throws", () => {
  const cache = new LRUCache<number, string>(2);
  cache.set(1, "one");
  cache.set(2, "two");
  cache.has(1);
  cache.set(3, "three"); // 1 is still the oldest
  assert.deepEqual(cache.keys(), [2, 3]);
  assert.throws(() => new LRUCache(0));
  assert.throws(() => new LRUCache(-1));
});

await test("B: memoize caches by arguments", () => {
  let calls = 0;
  const slowAdd = (a: number, b: number) => {
    calls++;
    return a + b;
  };
  const fastAdd = memoize(slowAdd, 2);
  assert.equal(fastAdd(1, 2), 3);
  assert.equal(fastAdd(1, 2), 3);
  assert.equal(calls, 1);
  assert.equal(fastAdd(2, 1), 3); // different argument order => different key
  assert.equal(calls, 2);
  fastAdd(5, 5); // evicts (1,2)
  fastAdd(1, 2);
  assert.equal(calls, 4);
});

if (failed) process.exitCode = 1;

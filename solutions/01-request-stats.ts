/**
 * EXERCISE 1 — Request statistics (warm-up, ~10 min)
 *
 * MeetsMore customers post "service requests" and pros send quotes.
 * Given a list of requests, implement the four functions below.
 *
 * Skills: interfaces, Record vs Map, reduce/filter/sort, comparator functions.
 */

export interface ServiceRequest {
  id: string;
  category: string; // "cleaning" | "moving" | "photography" ...
  city: string;
  budget: number; // yen
  createdAt: string; // ISO date, e.g. "2026-10-01"
}

/** A) How many requests per category? */
export function countByCategory(requests: ServiceRequest[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of requests) {
    counts[r.category] = (counts[r.category] ?? 0) + 1;
  }
  return counts;
}

/**
 * B) The n cities with the most requests, most first.
 *    Ties are broken alphabetically. If n > number of cities, return all.
 */
export function topCities(requests: ServiceRequest[], n: number): string[] {
  const counts = new Map<string, number>();
  for (const r of requests) {
    counts.set(r.city, (counts.get(r.city) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([cityA, countA], [cityB, countB]) => countB - countA || cityA.localeCompare(cityB))
    .slice(0, n)
    .map(([city]) => city);
}

/** C) Average budget per category, rounded to the nearest integer. */
export function averageBudgetByCategory(requests: ServiceRequest[]): Map<string, number> {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const r of requests) {
    const t = totals.get(r.category) ?? { sum: 0, count: 0 };
    t.sum += r.budget;
    t.count += 1;
    totals.set(r.category, t);
  }
  const result = new Map<string, number>();
  for (const [category, { sum, count }] of totals) {
    result.set(category, Math.round(sum / count));
  }
  return result;
}

/**
 * D) Requests created between `from` and `to` (both inclusive),
 *    sorted by createdAt ascending, then by id ascending.
 *    Hint: ISO dates ("YYYY-MM-DD") compare correctly as strings.
 */
export function requestsInRange(requests: ServiceRequest[], from: string, to: string): ServiceRequest[] {
  return requests
    .filter((r) => r.createdAt >= from && r.createdAt <= to)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

// ---------------------------------------------------------------------------
// Tests — run with: npx tsx <this file>
// ---------------------------------------------------------------------------
import assert from "node:assert/strict";

const requests: ServiceRequest[] = [
  { id: "r1", category: "cleaning", city: "Tokyo", budget: 8000, createdAt: "2026-10-01" },
  { id: "r2", category: "moving", city: "Osaka", budget: 45000, createdAt: "2026-10-03" },
  { id: "r3", category: "cleaning", city: "Tokyo", budget: 12000, createdAt: "2026-10-05" },
  { id: "r4", category: "photography", city: "Kyoto", budget: 30000, createdAt: "2026-10-02" },
  { id: "r5", category: "cleaning", city: "Osaka", budget: 10000, createdAt: "2026-10-05" },
  { id: "r6", category: "moving", city: "Tokyo", budget: 60000, createdAt: "2026-10-07" },
  { id: "r7", category: "photography", city: "Osaka", budget: 25000, createdAt: "2026-10-09" },
];

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

await test("A: countByCategory", () => {
  assert.deepEqual(countByCategory(requests), { cleaning: 3, moving: 2, photography: 2 });
  assert.deepEqual(countByCategory([]), {});
});

await test("B: topCities with tie broken alphabetically", () => {
  assert.deepEqual(topCities(requests, 2), ["Osaka", "Tokyo"]);
  assert.deepEqual(topCities(requests, 10), ["Osaka", "Tokyo", "Kyoto"]);
  assert.deepEqual(topCities([], 3), []);
});

await test("C: averageBudgetByCategory", () => {
  const avg = averageBudgetByCategory(requests);
  assert.equal(avg.get("cleaning"), 10000);
  assert.equal(avg.get("moving"), 52500);
  assert.equal(avg.get("photography"), 27500);
  assert.equal(avg.size, 3);
});

await test("D: requestsInRange inclusive and sorted", () => {
  const ids = requestsInRange(requests, "2026-10-02", "2026-10-05").map((r) => r.id);
  assert.deepEqual(ids, ["r4", "r2", "r3", "r5"]);
  assert.deepEqual(requestsInRange(requests, "2027-01-01", "2027-12-31"), []);
});

if (failed) process.exitCode = 1;

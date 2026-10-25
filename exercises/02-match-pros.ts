/**
 * EXERCISE 2 — Matching pros to a request (~15 min)
 *
 * A customer posts a request; we must suggest the best pros.
 *
 * A pro is ELIGIBLE when ALL of these hold:
 *   1. pro.categories includes request.category
 *   2. same city, compared case-insensitively ("tokyo" === "Tokyo")
 *   3. pro.activeJobs < pro.maxJobs
 *   4. pro.available is not false (undefined counts as available)
 *
 * score = round(rating * 20) + min(reviewCount, 20)
 *
 * Order: score DESC, then activeJobs ASC, then name ASC. Return at most `limit`.
 *
 * Skills: optional properties, literal union types, filter/map/sort chains,
 *         separating "why rejected" from "is eligible".
 *
 * Run:  npx tsx exercises/02-match-pros.ts
 */

export interface Pro {
  id: string;
  name: string;
  categories: string[];
  city: string;
  rating: number; // 0..5
  reviewCount: number;
  activeJobs: number;
  maxJobs: number;
  available?: boolean; // undefined => available
}

export interface MatchRequest {
  category: string;
  city: string;
  budget: number;
}

export interface Match {
  proId: string;
  name: string;
  score: number;
}

export type RejectionReason = "wrong-category" | "wrong-city" | "no-capacity" | "unavailable";

/**
 * A) Why is this pro NOT eligible? Return null when eligible.
 *    Check in the order listed above and return the FIRST failing reason.
 */
export function explainRejection(request: MatchRequest, pro: Pro): RejectionReason | null {
  throw new Error("TODO");
}

/** B) Best `limit` eligible pros, ordered as described above. */
export function matchPros(request: MatchRequest, pros: Pro[], limit: number): Match[] {
  throw new Error("TODO");
}

// ---------------------------------------------------------------------------
// Tests — run with: npx tsx <this file>
// ---------------------------------------------------------------------------
import assert from "node:assert/strict";

const pros: Pro[] = [
  { id: "p1", name: "Aiko", categories: ["cleaning"], city: "Tokyo", rating: 4.8, reviewCount: 120, activeJobs: 2, maxJobs: 5 },
  { id: "p2", name: "Ben", categories: ["cleaning", "moving"], city: "tokyo", rating: 4.5, reviewCount: 10, activeJobs: 0, maxJobs: 3 },
  { id: "p3", name: "Chika", categories: ["cleaning"], city: "Tokyo", rating: 4.8, reviewCount: 120, activeJobs: 1, maxJobs: 5 },
  { id: "p4", name: "Daichi", categories: ["cleaning"], city: "Osaka", rating: 5, reviewCount: 300, activeJobs: 0, maxJobs: 5 },
  { id: "p5", name: "Emi", categories: ["cleaning"], city: "Tokyo", rating: 5, reviewCount: 50, activeJobs: 5, maxJobs: 5 },
  { id: "p6", name: "Fumi", categories: ["cleaning"], city: "Tokyo", rating: 5, reviewCount: 50, activeJobs: 0, maxJobs: 5, available: false },
  { id: "p7", name: "Goro", categories: ["moving"], city: "Tokyo", rating: 4.9, reviewCount: 80, activeJobs: 0, maxJobs: 2 },
];

const cleaningTokyo: MatchRequest = { category: "cleaning", city: "Tokyo", budget: 10000 };

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

await test("A: explainRejection returns the first failing rule", () => {
  assert.equal(explainRejection(cleaningTokyo, pros[0]!), null);
  assert.equal(explainRejection(cleaningTokyo, pros[1]!), null); // "tokyo" matches "Tokyo"
  assert.equal(explainRejection(cleaningTokyo, pros[3]!), "wrong-city");
  assert.equal(explainRejection(cleaningTokyo, pros[4]!), "no-capacity");
  assert.equal(explainRejection(cleaningTokyo, pros[5]!), "unavailable");
  assert.equal(explainRejection(cleaningTokyo, pros[6]!), "wrong-category");
});

await test("B: matchPros orders by score, then activeJobs, then name", () => {
  assert.deepEqual(matchPros(cleaningTokyo, pros, 10), [
    { proId: "p3", name: "Chika", score: 116 },
    { proId: "p1", name: "Aiko", score: 116 },
    { proId: "p2", name: "Ben", score: 100 },
  ]);
});

await test("B: matchPros respects limit", () => {
  assert.deepEqual(matchPros(cleaningTokyo, pros, 2).map((m) => m.proId), ["p3", "p1"]);
  assert.deepEqual(matchPros(cleaningTokyo, pros, 0), []);
});

await test("B: other category / no matches", () => {
  assert.deepEqual(matchPros({ category: "moving", city: "TOKYO", budget: 50000 }, pros, 10).map((m) => m.proId), ["p7", "p2"]);
  assert.deepEqual(matchPros({ category: "plumbing", city: "Tokyo", budget: 5000 }, pros, 10), []);
});

await test("B: input array is not mutated", () => {
  const copy = pros.map((p) => p.id);
  matchPros(cleaningTokyo, pros, 10);
  assert.deepEqual(pros.map((p) => p.id), copy);
});

if (failed) process.exitCode = 1;

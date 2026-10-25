/**
 * EXERCISE 6 — String manipulation (~15 min)
 *
 * Four small string helpers a marketplace backend actually needs.
 *
 * Skills: regex basics (character classes, +, g flag), replace with a callback,
 *         split/join/trim/padStart, tuple types, Set, sorting word counts.
 *
 * Run:  npx tsx exercises/06-string-utils.ts
 */

/**
 * A) URL slug: lowercase, every run of characters that is not a-z or 0-9
 *    becomes a single "-", and there is no leading or trailing "-".
 *    "  Tokyo  House Cleaning! " => "tokyo-house-cleaning"
 */
export function slugify(text: string): string {
  throw new Error("TODO");
}

/**
 * B) Mask a Japanese phone number for display.
 *    Remove spaces and hyphens first. The result must have 10 or 11 digits,
 *    otherwise throw an Error. Keep the first 3 and last 4 digits, replace
 *    everything in between with "*".
 *    "090-1234-5678" => "090****5678"      "03 1234 5678" => "031***5678"
 */
export function maskPhone(phone: string): string {
  throw new Error("TODO");
}

/**
 * C) Replace every {{key}} (spaces inside the braces are allowed: {{ key }})
 *    with vars[key]. Numbers are converted with String(). If a key is not
 *    in vars, throw new Error(`Missing variable: ${key}`).
 *    renderTemplate("Hi {{name}}, ¥{{price}}", { name: "Aiko", price: 8000 })
 *      => "Hi Aiko, ¥8000"
 */
export function renderTemplate(template: string, vars: Record<string, string | number>): string {
  throw new Error("TODO");
}

/**
 * D) The n most frequent words in a review text.
 *    Lowercase everything, split on anything that is not a letter or digit,
 *    ignore empty strings and words in `stopWords`.
 *    Sort by count DESC, then word ASC. Return [word, count] pairs.
 *    topWords("Great pro! The pro was great, really great.", 2, new Set(["the", "was"]))
 *      => [["great", 3], ["pro", 2]]
 */
export function topWords(text: string, n: number, stopWords: Set<string>): [string, number][] {
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

await test("A: slugify", () => {
  assert.equal(slugify("  Tokyo  House Cleaning! "), "tokyo-house-cleaning");
  assert.equal(slugify("Wedding Photography (Osaka) 2026"), "wedding-photography-osaka-2026");
  assert.equal(slugify("already-a-slug"), "already-a-slug");
  assert.equal(slugify("___"), "");
  assert.equal(slugify(""), "");
});

await test("B: maskPhone", () => {
  assert.equal(maskPhone("090-1234-5678"), "090****5678");
  assert.equal(maskPhone("09012345678"), "090****5678");
  assert.equal(maskPhone("03 1234 5678"), "031***5678");
});

await test("B: maskPhone rejects bad input", () => {
  assert.throws(() => maskPhone("1234"));
  assert.throws(() => maskPhone("090-1234-56789-0"));
  assert.throws(() => maskPhone("090-abcd-5678"));
});

await test("C: renderTemplate", () => {
  assert.equal(renderTemplate("Hi {{name}}, ¥{{price}}", { name: "Aiko", price: 8000 }), "Hi Aiko, ¥8000");
  assert.equal(renderTemplate("{{ a }}-{{a}}-{{b}}", { a: "x", b: "y" }), "x-x-y");
  assert.equal(renderTemplate("no placeholders", {}), "no placeholders");
  assert.equal(renderTemplate("", { a: "x" }), "");
});

await test("C: renderTemplate throws on missing key", () => {
  assert.throws(() => renderTemplate("Hi {{name}}", {}), { message: "Missing variable: name" });
});

await test("D: topWords", () => {
  const stop = new Set(["the", "was", "a", "and"]);
  assert.deepEqual(topWords("Great pro! The pro was great, really great.", 2, stop), [
    ["great", 3],
    ["pro", 2],
  ]);
  assert.deepEqual(topWords("Fast and clean. Clean and FAST!", 5, stop), [
    ["clean", 2],
    ["fast", 2],
  ]);
  assert.deepEqual(topWords("", 3, stop), []);
  assert.deepEqual(topWords("the the the", 3, stop), []);
});

if (failed) process.exitCode = 1;

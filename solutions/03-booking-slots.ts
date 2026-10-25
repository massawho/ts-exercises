/**
 * EXERCISE 3 — Booking slots (~15 min)
 *
 * A pro's calendar is a list of busy time slots in one day.
 * Times are represented as MINUTES FROM MIDNIGHT (09:30 => 570).
 *
 * Skills: string parsing + validation, throwing errors, sorting intervals,
 *         the classic "merge overlapping intervals" algorithm, edge cases.
 */

export interface Slot {
  start: number; // minutes from midnight, inclusive
  end: number; // minutes from midnight, exclusive
}

/**
 * A) Parse "HH:MM-HH:MM" into a Slot.
 *    Throw an Error for: wrong format, hours > 23, minutes > 59, end <= start.
 */
export function parseSlot(text: string): Slot {
  const match = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(text);
  if (!match) throw new Error(`Invalid slot format: "${text}"`);
  const [h1, m1, h2, m2] = match.slice(1).map(Number) as [number, number, number, number];
  for (const [h, m] of [[h1, m1], [h2, m2]]) {
    if (h! > 23 || m! > 59) throw new Error(`Invalid time in "${text}"`);
  }
  const start = h1 * 60 + m1;
  const end = h2 * 60 + m2;
  if (end <= start) throw new Error(`End must be after start: "${text}"`);
  return { start, end };
}

/** B) Format a Slot back to "HH:MM-HH:MM". */
export function formatSlot(slot: Slot): string {
  const fmt = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return `${fmt(slot.start)}-${fmt(slot.end)}`;
}

/**
 * C) Merge overlapping OR touching slots. Result is sorted by start.
 *    [09:00-10:30, 10:00-12:00, 13:00-14:00, 14:00-15:00]
 *      => [09:00-12:00, 13:00-15:00]
 *    Must not mutate the input.
 */
export function mergeSlots(slots: Slot[]): Slot[] {
  const sorted = [...slots].sort((a, b) => a.start - b.start);
  const merged: Slot[] = [];
  for (const slot of sorted) {
    const last = merged[merged.length - 1];
    if (last && slot.start <= last.end) {
      last.end = Math.max(last.end, slot.end);
    } else {
      merged.push({ ...slot });
    }
  }
  return merged;
}

/**
 * D) Free slots inside `day` that are at least `minDuration` minutes long,
 *    given the (possibly unsorted, possibly overlapping) busy slots.
 *    Busy time outside `day` is ignored.
 */
export function freeSlots(busy: Slot[], day: Slot, minDuration: number): Slot[] {
  const free: Slot[] = [];
  let cursor = day.start;
  for (const b of mergeSlots(busy)) {
    if (b.end <= day.start || b.start >= day.end) continue; // outside the day
    if (b.start - cursor >= minDuration) free.push({ start: cursor, end: b.start });
    cursor = Math.max(cursor, b.end);
  }
  if (day.end - cursor >= minDuration) free.push({ start: cursor, end: day.end });
  return free;
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

const s = (text: string) => parseSlot(text);
const f = (slots: Slot[]) => slots.map(formatSlot);

await test("A: parseSlot valid input", () => {
  assert.deepEqual(parseSlot("09:00-10:30"), { start: 540, end: 630 });
  assert.deepEqual(parseSlot("00:00-23:59"), { start: 0, end: 1439 });
});

await test("A: parseSlot rejects bad input", () => {
  assert.throws(() => parseSlot("9:00-10:30"));
  assert.throws(() => parseSlot("abc"));
  assert.throws(() => parseSlot("10:00-09:00"));
  assert.throws(() => parseSlot("10:00-10:00"));
  assert.throws(() => parseSlot("25:00-26:00"));
  assert.throws(() => parseSlot("10:60-11:00"));
});

await test("B: formatSlot pads with zeros", () => {
  assert.equal(formatSlot({ start: 540, end: 630 }), "09:00-10:30");
  assert.equal(formatSlot({ start: 5, end: 65 }), "00:05-01:05");
});

await test("C: mergeSlots merges overlapping and touching", () => {
  const input = [s("13:00-14:00"), s("09:00-10:30"), s("14:00-15:00"), s("10:00-12:00")];
  const snapshot = JSON.stringify(input);
  assert.deepEqual(f(mergeSlots(input)), ["09:00-12:00", "13:00-15:00"]);
  assert.equal(JSON.stringify(input), snapshot, "input must not be mutated");
  assert.deepEqual(mergeSlots([]), []);
  assert.deepEqual(f(mergeSlots([s("09:00-10:00"), s("09:15-09:30")])), ["09:00-10:00"]);
});

await test("D: freeSlots basic", () => {
  const busy = [s("13:00-14:30"), s("10:00-11:00")];
  const day = s("09:00-18:00");
  assert.deepEqual(f(freeSlots(busy, day, 60)), ["09:00-10:00", "11:00-13:00", "14:30-18:00"]);
  assert.deepEqual(f(freeSlots(busy, day, 90)), ["11:00-13:00", "14:30-18:00"]);
});

await test("D: freeSlots edge cases", () => {
  const day = s("09:00-18:00");
  assert.deepEqual(f(freeSlots([], day, 30)), ["09:00-18:00"]);
  assert.deepEqual(f(freeSlots([s("08:00-19:00")], day, 30)), []);
  assert.deepEqual(f(freeSlots([s("07:00-09:30"), s("17:00-20:00")], day, 30)), ["09:30-17:00"]);
  assert.deepEqual(f(freeSlots([s("09:00-10:00"), s("09:30-10:30")], day, 30)), ["10:30-18:00"]);
});

if (failed) process.exitCode = 1;

# TypeScript cheat sheet for the interview

TypeScript = JavaScript + type annotations. If you remove every `: Type` and `<T>` you get valid JS.
When in doubt in the interview: write the JavaScript first, add types after.

## Basic annotations

```ts
let n: number = 5;             // usually inferred — `let n = 5` is enough
let s: string = "hi";
let ok: boolean = true;
let ids: string[] = ["a"];     // array of strings  (same as Array<string>)
let maybe: string | undefined; // union: one of these types
let nothing: null = null;

function add(a: number, b: number): number { return a + b; }
const double = (x: number): number => x * 2;   // arrow function
const log = (msg: string): void => { console.log(msg); };   // returns nothing
```

## Describing objects: interface and type

```ts
interface Pro {
  id: string;
  rating: number;
  available?: boolean;    // ? = optional, type becomes boolean | undefined
  readonly city: string;  // cannot be reassigned
}

type Reason = "wrong-city" | "no-capacity";   // literal union: only these strings allowed
type Slot = { start: number; end: number };   // `type` and `interface` are interchangeable here
```

Prefer `interface` for objects, `type` for unions and aliases. Interviewers don't care which.

## Dictionaries: Record vs Map

```ts
// Plain object with string keys
const counts: Record<string, number> = {};
counts["cleaning"] = (counts["cleaning"] ?? 0) + 1;
Object.keys(counts); Object.entries(counts);     // [["cleaning", 1], ...]

// Map: any key type, remembers insertion order, has .size
const m = new Map<string, number>();
m.set("a", 1); m.get("a"); m.has("a"); m.delete("a"); m.size;
for (const [key, value] of m) { ... }
[...m.entries()]  // to array, so you can .sort() / .map()
```

## Array methods you will use constantly

```ts
xs.map(x => x * 2)                       // transform
xs.filter(x => x > 1)                    // keep some
xs.find(x => x.id === "p1")              // first match or undefined
xs.some(x => x > 1)   xs.every(x => x > 1)
xs.includes(3)
xs.reduce((sum, x) => sum + x, 0)        // fold to one value
xs.slice(0, n)                           // first n (copy, no mutation)
xs.flatMap(x => [x, x])
[...xs]                                  // shallow copy
Array.from({ length: 3 }, (_, i) => i)   // [0, 1, 2]

// SORT: mutates in place and sorts as STRINGS by default ([10, 9, 1] -> [1, 10, 9]).
// Always pass a comparator; copy first if you must not mutate.
[...xs].sort((a, b) => a - b);                       // numbers ascending
pros.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));  // desc, then name
```

The `||` trick: `b.rating - a.rating` is 0 on a tie, so the next comparison is used.

## Null safety (strict mode is on)

```ts
const pro = pros.find(p => p.id === "x");  // type: Pro | undefined
pro.name;        // ERROR: pro may be undefined
pro?.name;       // undefined if pro is undefined (optional chaining)
pro!.name;       // "trust me, it's defined" — avoid in interviews unless you explain why
if (pro) { pro.name }   // narrowing: inside the if, pro is Pro

value ?? fallback   // fallback only when value is null/undefined (0 and "" are kept)
value || fallback   // fallback when value is falsy (0, "", false too)
```

`arr[i]` is typed `T | undefined` with the config in this repo, so `arr[i]!` or a check is needed.

## Generics (functions that work for any type)

```ts
function first<T>(xs: T[]): T | undefined { return xs[0]; }
first([1, 2]);        // T inferred as number
first(["a"]);         // T inferred as string

class Cache<K, V> {
  private map = new Map<K, V>();
  get(key: K): V | undefined { return this.map.get(key); }
}
```

Read `<T>` as "for some type T that the caller chooses".

## Classes

```ts
class Counter {
  private count = 0;                           // field with initializer
  constructor(private readonly step: number) {} // shorthand: declares + assigns this.step
  increment(): void { this.count += this.step; }
  get value(): number { return this.count; }   // getter: counter.value, no ()
}
```

## Errors

```ts
throw new Error("End must be after start");

try {
  risky();
} catch (err) {                 // err is `unknown` in strict mode
  if (err instanceof Error) console.log(err.message);
}
```

## Async

```ts
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function load(id: string): Promise<Pro> { ... }   // async fn always returns a Promise
const pro = await load("p1");                           // inside async fn or top level in ESM

await Promise.all(ids.map(id => load(id)));   // parallel, results in input order, fails fast
await Promise.race([p1, p2]);                 // first to settle wins
await Promise.allSettled([...]);              // never throws; gives {status, value|reason}
```

Common mistake: `items.forEach(async ...)` does not wait. Use `for (const x of items) await ...`
for sequential, or `Promise.all(items.map(...))` for parallel.

## Small things that trip non-TS people

- `===` always. `==` does type coercion.
- `const` by default, `let` when reassigning, never `var`.
- Destructuring: `const { id, name } = pro;`  `const [first, second] = pair;`
- Spread: `{ ...pro, rating: 5 }` makes a copy with one field changed.
- Template strings: `` `${hours}:${minutes}` ``.
- `String(5).padStart(2, "0")` → `"05"`. `Math.floor`, `Math.round`, `Math.max(...xs)`.
- Strings compare lexically: `"2026-10-02" < "2026-10-10"` works for ISO dates.
- `as` is a cast (`x as string`). It does not convert, it only silences the checker.
- `unknown` = "could be anything, check before using". `any` = "turn off checking" (avoid).
- Red squiggle you don't understand? Read the message from the end; it usually says
  "Type X is not assignable to type Y" and names the missing property.

## Strings and regex (exercise 6)

```ts
s.trim()  s.toLowerCase()  s.slice(0, 3)  s.slice(-4)  s.split(",")  parts.join("-")
"*".repeat(4)        // "****"
s.includes("x")  s.startsWith("x")  s.replaceAll("a", "b")

/[^a-z0-9]+/g        // one or more chars that are NOT a-z or 0-9; g = all matches
/^\d{10,11}$/        // whole string is 10 or 11 digits   (^ start, $ end, \d digit)
/\{\{\s*(\w+)\s*\}\}/g   // {{ key }} — braces escaped, (\w+) captures the key

regex.test(s)                                  // boolean
s.replace(/x/g, "y")                           // string replacement
s.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key])  // callback gets the capture groups
s.split(/[^a-z0-9]+/)                          // split on a regex; may produce "" at the ends
```

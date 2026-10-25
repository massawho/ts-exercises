# MeetsMore TypeScript interview practice

Six exercises shaped like a 60-minute live coding session with an Engineering Manager.
Each file contains the problem statement, typed function stubs, and tests at the bottom.
Solutions are in `solutions/` — don't peek until you've tried.

## Setup (already done)

```bash
npm install            # typescript + tsx
npx tsx exercises/01-request-stats.ts   # run one exercise (shows ✓ / ✗ per test)
npx tsc                                 # type-check everything (no output = good)
npm test                                # run all solutions
```

## The exercises

| # | File | Time | What it trains |
|---|------|------|----------------|
| 1 | `exercises/01-request-stats.ts` | 10 min | Warm-up: Record vs Map, reduce, sort comparators, string dates |
| 2 | `exercises/02-match-pros.ts` | 15 min | Business rules → code: optional props, literal unions, filter/sort chains |
| 3 | `exercises/03-booking-slots.ts` | 15 min | Parsing + validation, throwing errors, merge intervals, edge cases |
| 4 | `exercises/04-lru-cache.ts` | 15 min | Classes, generics, Map insertion order, closures (memoize) |
| 5 | `exercises/05-async-utils.ts` | 15 min | Promises, async/await, retry, concurrency limit, timeout |
| 6 | `exercises/06-string-utils.ts` | 15 min | Regex, replace with callback, split/slice/repeat, tuples, word counts |

Exercises 1–3 are the most likely shape for a product company like MeetsMore (a marketplace
matching customers with local pros). Exercise 4 is a classic "implement a data structure" question.
Exercise 5 covers the async questions that TypeScript interviewers love because they expose
whether you really understand Promises. Exercise 6 is pure string work (slugs, masking, templates,
word counts), which shows up in almost every live coding round because it needs no setup.

## How to practice (do this, not just the code)

The email says they test "programming thought process and how well you handle working with others".
So practice the *process*, with a timer, talking out loud:

1. **Restate the problem** in one sentence before typing. Say what the input and output are.
2. **Ask one clarifying question** per exercise, even when practicing alone. Examples that
   apply here: "Is city matching case-sensitive?", "Are slot ends inclusive?", "What if `n` is 0?"
   In the real interview the EM *wants* these questions.
3. **Write the examples first.** Say "for this input I expect this output" and jot it as a comment.
4. **Write the simplest version that passes**, then say "now I'd clean this up by..." and do it.
5. **Walk through one edge case** aloud: empty array, duplicates, limit of 0, already sorted.
6. **When stuck, say what you're stuck on.** "I don't remember whether `sort` mutates the array,
   let me check" is a good answer. Silence is the only bad answer. Open-book means you can Google
   `Array.prototype.sort` or `Map keys order`, and saying so looks like a normal engineer.

## Round two (a day later)

Delete your solution bodies and redo exercises 2, 3, 5, and 6 in under 15 minutes each.
Then read `solutions/` and compare style: where did you write a loop that could be a `map`,
or a `map` that was clearer as a loop?

## The TypeScript you actually need

See `CHEATSHEET.md`. It covers only the syntax these exercises (and most interviews) use.

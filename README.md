# archaste

Using typescript compiler to discover what my ts code does

## Context

I'd like to figure out what my team and I should do (if anything) about the ~500 cloud functions we have deployed in GCP, accessing lots of services & databases.

I started to analyze manually a first function, building architecture & sequence diagrams. Took me 2 hours.

My hypothesis is: in order for me to understand what can be done, I don't need to go in details for each function, but rather build a mapping of (functions, list of services / databases accessed) to get an high level overview of who accesses what.

## Ideas

1. I initially wanted to kind of monkey patch the clients we have for these services, and run our test suite. Tried, too long, not fun.
1. Use / build a code analyzer. Fun. No idea if it'll work

Decided to do it the fun way (:tada:), because

- It's Saturday,
- I'm not on-call,
- I don't know anything about typescript, I'll probably learn some stuff!

## Disclaimer

It's my first non hello-world program in ts: I've basically no idea what I'm doing.

If you try this out on your side, and it doesn't work: please let me know, but I'm sure you know more than me!

## How to run

You probably need to `cd` in the project and `npm install` it first

`npx ts-node main.ts samples/foo.ts`

Currently, it should output something like:

```
➜  archaste git:(main) npx ts-node main.ts samples/foo.ts
samples/foo.ts
--------  test
----------------  my_logger
------------------------  console.log(any)      samples/foo.ts:10:13 -
----------------  my_logger("test")     samples/foo.ts:14:5 -
```

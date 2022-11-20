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

### MarkMap

Generate a [MarkMap](https://markmap.js.org/) compatible markdown file using the following command:

```bash
npm run --silent main <path-to-file> -- --markmap
```

This will write to standard output a markmap compatible markdown file.

### Mermaid

Generate a markdown compatible [Mermaid](https://mermaid-js.github.io/mermaid/#/) graph using this command:

```bash
npm run --silent main <path-to-file> -- --mermaid
```

This will write to standard output a mermaid compatible markdown file.

### D3.js

(doesn't work well for now)

The `sites` directory contains the webpage for rendering the tree. For now, the tree is materialized in a json file named `tree.json`.

To generate this json, run

```bash
npm run --silent main <path-to-file> -- --importJson
```

This will write a json file to standard output, which you can redirect to `sites/tree.json` file.

Then, run

```bash
npx http-server sites
```

and access the webpage at `http://127.0.0.1:8080`

## Next steps

- [ ] frontend: generate several output types
  - [ ] generate mermaid compatible markdown file
  - [ ] generate markmap compatible markdown file
- [ ] backend - implement function call tree
- [ ] make main executable a decent cli (probably using [commander](https://www.npmjs.com/package/commander))

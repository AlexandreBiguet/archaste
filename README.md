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

The `sites` directory contains the webpage for rendering the tree. For now, the tree is materialized in a json file named `tree.json`, with the following format:

```json
{
  "name": "samples/foo.ts",
  "parent": null,
  "children": [
    {
      "name": "samples/bar.ts",
      "parent": "samples/foo.ts",
      "children": [
        {
          "name": "samples/baz.ts",
          "parent": "samples/bar.ts",
          "children": []
        }
      ]
    }
  ]
}
```

To generate this json, run

```bash
npx ts-node src/main.ts <path-to-file>
```

Copy paste the output of that command in `tree.json` file in the `sites` directory.

Then, run

```bash
npx http-server sites
```

and access the webpage at `http://127.0.0.1:8080`

## Next steps

- [ ] frontend - generate mermaid instead of json so that output could be added directly into a doc
- [ ] backend - implement function call tree

# gitbook-summary-generator

a tool help to generate gitbook summary automatically width one npm script

## Getting started

```bash
$ npm i gitbook-summary-generator

## generate summary.md
$ gitbooks gen
```

## Configuration

supoprt **book.json** configuration, e.g.

```json
{
  "gitbooksConfig": {
    "src": "",
    "ignore": "",
    "script": ""
  }
}
```

### src

indicate the book entry, `process.cwd` will be used as default if **src** is not defined.

### ignore

file that matches ignore conditions will not be generated in **SUMMARY.md** file

```json
{
  "gitbooksConfig": {
    "ignore": "foo.md"
  }
}
```

It can also take a list of files to ignore.

```json
{
  "gitbooksConfig": {
    "ignore": ["foo.md", "*foo.md", "private"]
  }
}
```

ignore files names foo.md or ends with foo.md or files that in private dir

### script

you can file a node module that export a function as default to accept a rendered summary string to handle before which written into the **SUMMARY.md**.

```json
{
  "gitbooksConfig": {
    "script": "./summaryScript.js"
  }
}
```

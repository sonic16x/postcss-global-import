# [Postcss](https://github.com/postcss/postcss) global import.

[![npm package][npm-badge]][npm]
[![build status](https://img.shields.io/travis/scherebedov/postcss-global-import/master.svg?style=flat-square)](https://travis-ci.org/scherebedov/postcss-global-import)

[npm-badge]: https://img.shields.io/npm/v/postcss-global-import.svg?style=flat-square
[npm]: https://www.npmjs.org/package/postcss-global-import


## Installation

```
npm install --save postcss-global-import
```

## Example

Having files foo.css:

```css
.foo {
  color: green;
}

@media (min-width: 640px) {
  .foo {
    color: red
  }
}
```

And local.css:

```css
@global-import "./foo.css";

/* Some Css */
```

We will get:

```css
:global .foo {
  color: green;
}

@media (min-width: 640px) {
  :global .foo {
    color: red
  }
}

/* Some Css */
```

## Options

### sync

In case of sync enabled this plugin will be work synchronously. It's useful in case with usage
`css-modules-require-hook` hook, which doesn't support async postcss plugins.

## Webpack config example
```js
const globalImport = require('postcss-global-import');

module.exports = {
  module: {
      loaders: [
          {
              test:   /\.css$/,
              loader: "style-loader!css-loader!postcss-loader"
          }
      ]
  },
  postcss: [
    globalImport()
  ]
}
```

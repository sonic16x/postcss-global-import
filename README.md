# [Postcss](https://github.com/postcss/postcss) global import.

[![npm package][npm-badge]][npm]

[npm-badge]: https://img.shields.io/npm/v/postcss-global-import.svg?style=flat-square
[npm]: https://www.npmjs.org/package/postcss-global-import

## Installation

```
npm install --save postcss-global-import
```

## Example

```css
@global-import './some-file.css'
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

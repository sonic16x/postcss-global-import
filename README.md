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

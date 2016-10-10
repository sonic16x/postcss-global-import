# [Postcss](https://github.com/postcss/postcss) global import.

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

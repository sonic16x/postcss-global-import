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

## Known limitations

This plugin do nothing for css animation names.

And currently, there is no way to escape animation name in `animation-name` or a`animation` properties
for plugin [postcss-modules-local-by-default](https://www.npmjs.com/package/postcss-modules-local-by-default)
which currently using as dependency [postcss-modules](https://github.com/css-modules/postcss-modules) plugin.
So, in other words, if you are using [postcss-modules](https://github.com/css-modules/postcss-modules) or
 [postcss-modules-local-by-default](https://www.npmjs.com/package/postcss-modules-local-by-default) plugins, following css would
 be not imported properly:

```css
@keyframes myCoolAnimation {
}

.foo {
	animation: myCoolAnimation;
}
```

And animation property value `myCoolAnimation` will be renamed:

```css
@keyframes myCoolAnimation {
}

.foo {
	animation: _myCoolAnimation__7zliz_1;
}
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

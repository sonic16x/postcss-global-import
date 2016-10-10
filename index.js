var fs = require('fs');
var path = require('path');
var nodeResolve = require('resolve');
var postcss = require('postcss');

/**
 * Plugin for PostCSS, which can do global import in Css.
 * Global import don't modify class names inside file, where he imports,
 * for example, for import Leaflet or Bootstrap css files.
 *
 * @example:
 * @global-import './some-file.css';
 */
module.exports = postcss.plugin('postcss-global-import', function () {
  return function (root, result) {
    let promises = [];

    root.walkAtRules('global-import', atrule => {
      const moduledirname = path.dirname(root.source.input.file);
      const modulepath = atrule.params.replace(/'?"?/g, '');

      let resolvedModulePath;

      const task = resolvePath(modulepath, { basedir: moduledirname })
        .then(modulepath => {
          resolvedModulePath = modulepath;
          return modulepath;
        })
        .then(modulepath => readModule(modulepath))
        .then((res) => {
          const css = postcss.parse(res, {
            from: resolvedModulePath
          });

          // Выставляем названия директив @keyframes в global
          css.walkAtRules(rule => {
            if (rule.name.indexOf('keyframes') !== -1) {
              rule.params = `:global(${rule.params})`;
            }
          });

          css.walkRules(rule => {
            const outer = rule.parent;
            const inAtrule = outer.type === 'atrule';
            const inKeyframes = outer.name && outer.name.indexOf('keyframes') === -1;

            if (!inAtrule && !inKeyframes) {
              rule.replaceWith(postcss.parse(`:global { ${rule.toString()} }`, {
                from: resolvedModulePath
              }));
            }
          });

          atrule.replaceWith(css);
        })
        .catch(err => {
          console.error(err);
          process.exit(1);
        });

      promises.push(task);
    });

    return promises.length ? Promise.all(promises) : result;
  };
});

function resolvePath (filepath, options) {
  return new Promise(function (resolve, reject) {
    nodeResolve(filepath, options, (e, res) => (e) ? reject(e) : resolve(res));
  });
}

function readModule (filepath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filepath, 'utf8', (e, res) => (e) ? reject(e) : resolve(res));
  });
}

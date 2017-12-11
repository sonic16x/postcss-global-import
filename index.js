const fs = require('fs');
const path = require('path');
const nodeResolve = require('resolve');
const postcss = require('postcss');
const selectorTokenizer = require('css-selector-tokenizer');

function globalizeSelectors (selector) {
  const selectors = selectorTokenizer.parse(selector);

  const wrapToGlobal = (classNode) => {
    return {
      type: 'nested-pseudo-class',
      name: 'global',
      nodes: [
        {
          type: 'selector',
          nodes: [ classNode ]
        }
      ]
    }
  };

  const walkNodes = (nodes) => {
    return nodes.map(node => {
      if (node.type === 'class' || node.type === 'id') {
        return wrapToGlobal(node);
      } else if (node.type === 'selector' || (node.type === 'nested-pseudo-class' && node.name !== 'global')) {
        return Object.assign({}, node, {
          nodes: walkNodes(node.nodes)
        });
      }
      return node;
    });
  };

  return selectorTokenizer.stringify({
    type: 'selectors',
    nodes: walkNodes(selectors.nodes)
  });
}

/**
 * Plugin for PostCSS, which can do global import in Css.
 * Global import don't modify class names inside file, where he imports,
 * for example, for import Leaflet or Bootstrap css files.
 *
 * @example:
 * @global-import './some-file.css';
 */
module.exports = postcss.plugin('postcss-global-import', function (options) {
  const sync = options && options.sync;
  const globalizeKeyframes = options && options.globalizeKeyframes;

  return function (root, result) {
    const processCss = (str, modulePath, atRule) => {
      const css = postcss.parse(str, {
        from: modulePath
      });

      // Выставляем названия директив @keyframes в global
      // @TODO: данная логика работает только для плагина postcss-modules-local-by-default
      // В будущем, когда postcss-modules перейдет на postcss-icss-selectors и postcss-icss-keyframes
      // последний не будет поддерживать именно такую семантику
      if (globalizeKeyframes) {
        css.walkAtRules(rule => {
          if (rule.name.indexOf('keyframes') !== -1) {
            rule.params = `:global(${rule.params})`;
          }
        });
      }

      css.walkRules(rule => {
        const outer = rule.parent;
        const inKeyframes = outer.name && outer.name.indexOf('keyframes') !== -1;

        if (!inKeyframes) {
          rule.replaceWith(rule.clone({
            selector: globalizeSelectors(rule.selector)
          }));
        }
      });

      atRule.replaceWith(css);
    };

    let promises = [];

    root.walkAtRules('global-import', atRule => {
      const moduleDirname = path.dirname(root.source.input.file);
      const modulePath = atRule.params.replace(/'?"?/g, '');

      let resolvedModulePath;

      if (sync) {
        resolvedModulePath = resolvePathSync(modulePath, { basedir: moduleDirname });
        processCss(readModuleSync(resolvedModulePath), resolvedModulePath, atRule);
      } else {
        const task = resolvePath(modulePath, { basedir: moduleDirname })
          .then(modulepath => {
            resolvedModulePath = modulepath;
            return modulepath;
          })
          .then(modulepath => readModule(modulepath))
          .then((res) => {
            processCss(res, resolvedModulePath, atRule);
          })
          .catch(err => {
            console.error(err);
            process.exit(1);
          });

        promises.push(task);
      }
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

function resolvePathSync (filepath, options) {
  return nodeResolve.sync(filepath, options);
}

function readModuleSync (filepath) {
  return fs.readFileSync(filepath, 'utf8');
}

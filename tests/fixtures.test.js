const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const glob = require('glob');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

const globalImport = require('../');
const modules = require('postcss-modules');
const cssnano = require('cssnano');

function processCss(file, options = {}) {
  const masterPath = file.replace(/\.css$/, '.master.css');
  const css = `@global-import "${file}"`;

  return new Promise(resolve => {
    postcss([
      globalImport(options),
      modules({ getJSON: ()=> {} }),
      cssnano()
    ])
      .process(css, { from: masterPath, to: '_.css' })
      .then(result => {
        resolve(result.css);
      });
  });
}

async function readExpectedFile(filePath) {
  const css = await readFile(filePath, 'utf8');
  return new Promise(resolve => {
    postcss([cssnano()])
      .process(css, { from: filePath })
      .then(result => resolve(result.css));
  });
}


describe('fixtures should be the same after being global imported and modulesified', () => {
  let files = glob.sync('tests/fixtures/*.css')
    .map(filePath => path.resolve(filePath));

  for (let filePath of files) {
    const basename = path.basename(filePath);
    test(`fixture ${basename}`, async () => {
      const processedCss = await processCss(filePath, {
        globalizeKeyframes: basename === 'only-keyframes.css',
      });
      const expectedCss = await readExpectedFile(filePath);

      expect(processedCss).toEqual(expectedCss);
    });
  }
});

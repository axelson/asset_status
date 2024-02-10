const esbuild = require("esbuild");
const fs = require('fs');

const args = process.argv.slice(2);
const watch = args.includes('--watch');
const deploy = args.includes('--deploy');

const BUILD_STATUS_FILE = 'esbuild_build_status';
fs.writeFileSync(BUILD_STATUS_FILE, 'building');

const loader = {
  // Add loaders for images/fonts/etc, e.g. { '.svg': 'file' }
};

let phoenixErrorStatusPlugin = {
  name: 'phoenix_error_status',
  setup(build) {
    build.onEnd(result => {
      console.log(`build ended with ${result.errors.length} errors`)
      if (result.errors.length > 0) {
        const errors = JSON.stringify(result.errors, undefined, 4)
        fs.writeFileSync(BUILD_STATUS_FILE, 'broken\n' + errors);
      } else {
        fs.writeFileSync(BUILD_STATUS_FILE, 'working');
      }
    })
  },
}

const plugins = [
  phoenixErrorStatusPlugin,
];

// Define esbuild options
let opts = {
  entryPoints: ["js/app.js"],
  bundle: true,
  logLevel: "info",
  target: "es2017",
  outdir: "../priv/static/assets",
  external: ["*.css", "fonts/*", "images/*"],
  loader: loader,
  plugins: plugins,
};

if (deploy) {
  opts = {
    ...opts,
    minify: true,
  };
}

if (watch) {
  opts = {
    ...opts,
    sourcemap: "inline",
  };
  esbuild
    .context(opts)
    .then((ctx) => {
      ctx.watch();
    })
    .catch((_error) => {
      process.exit(1);
    });
} else {
  esbuild.build(opts);
}

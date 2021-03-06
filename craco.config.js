const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const safePostCssParser = require("postcss-safe-parser");
const isWsl = require("is-wsl");

module.exports = function ({ env }) {
  // The values below are copied wholesale from the webpack.config.js that
  // CRA uses to generate it's builds.
  // The following values have been modified to tweak the minification steps
  // to support jujulib and the check-auth redux middleware for thunks.
  // Both jujulib and the check-auth middleware require that the function names
  // remain intact so we need to tell Terser to not mangle those names.
  // - mangle.reserved
  return {
    webpack: {
      configure: (webpackConfig, { env, paths }) => {
        const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
        const isEnvProduction = env === "production";
        const isEnvProductionProfile =
          isEnvProduction && process.argv.includes("--profile");
        return Object.assign(webpackConfig, {
          optimization: {
            minimize: isEnvProduction,
            minimizer: [
              // This is only used in production mode
              new TerserPlugin({
                terserOptions: {
                  parse: {
                    // We want terser to parse ecma 8 code. However, we don't want it
                    // to apply any minification steps that turns valid ecma 5 code
                    // into invalid ecma 5 code. This is why the 'compress' and 'output'
                    // sections only apply transformations that are ecma 5 safe
                    // https://github.com/facebook/create-react-app/pull/4234
                    ecma: 8,
                  },
                  compress: {
                    ecma: 5,
                    warnings: false,
                    // Disabled because of an issue with Uglify breaking seemingly valid code:
                    // https://github.com/facebook/create-react-app/issues/2376
                    // Pending further investigation:
                    // https://github.com/mishoo/UglifyJS2/issues/2011
                    comparisons: false,
                    // Disabled because of an issue with Terser breaking valid code:
                    // https://github.com/facebook/create-react-app/issues/5250
                    // Pending further investigation:
                    // https://github.com/terser-js/terser/issues/120
                    inline: 2,
                  },
                  mangle: {
                    safari10: true,
                    reserved: [
                      // Juju facades
                      "AnnotationsV2",
                      "ClientV2",
                      "ModelManagerV5",
                      "PingerV1",
                      "JIMMV1",
                      // Thunks
                      // March 25 2020 Jeff - This doesn't actually prevent the munging of these function
                      // names due to a bug in terser. Placing the values in `mangle.properties.reserved`
                      // causes terser to generate invalid code. In order to support the check-auth.js
                      // feature the `keep_fnames` property below has been hard coded to true and not
                      // determined by the --profile flag.
                      "connectAndStartPolling",
                      "logOut",
                    ],
                  },
                  // Added for profiling in devtools
                  keep_classnames: true,
                  keep_fnames: true,
                  output: {
                    ecma: 5,
                    comments: false,
                    // Turned on because emoji and regex is not minified properly using default
                    // https://github.com/facebook/create-react-app/issues/2488
                    ascii_only: true,
                  },
                },
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                // Disabled on WSL (Windows Subsystem for Linux) due to an issue with Terser
                // https://github.com/webpack-contrib/terser-webpack-plugin/issues/21
                parallel: !isWsl,
                // Enable file caching
                cache: true,
                sourceMap: shouldUseSourceMap,
              }),
              // This is only used in production mode
              new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                  parser: safePostCssParser,
                  map: shouldUseSourceMap
                    ? {
                        // `inline: false` forces the sourcemap to be output into a
                        // separate file
                        inline: false,
                        // `annotation: true` appends the sourceMappingURL to the end of
                        // the css file, helping the browser find the sourcemap
                        annotation: true,
                      }
                    : false,
                },
              }),
            ],
            // Automatically split vendor and commons
            // https://twitter.com/wSokra/status/969633336732905474
            // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
            splitChunks: {
              chunks: "all",
              name: false,
            },
            // Keep the runtime chunk separated to enable long term caching
            // https://twitter.com/wSokra/status/969679223278505985
            // https://github.com/facebook/create-react-app/issues/5358
            runtimeChunk: {
              name: (entrypoint) => `runtime-${entrypoint.name}`,
            },
          },
        });
      },
    },
  };
};

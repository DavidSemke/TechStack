const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  entry: "./public/javascripts/root.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "public", "javascripts"),
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  mode: "production",
}

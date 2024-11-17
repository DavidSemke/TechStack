const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  entry: path.join(__dirname, "src", "public", "javascripts", "root.js"),
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "src", "public", "javascripts"),
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

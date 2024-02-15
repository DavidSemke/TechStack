const path = require("path")

module.exports = {
  entry: "./public/javascripts/root.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "public", "javascripts"),
  },
  devtool: "source-map",
  mode: "development",
}

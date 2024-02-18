const path = require("path")

module.exports = {
  entry: "./public/javascripts/root.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "public", "javascripts"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  mode: "production",
}

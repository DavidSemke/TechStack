const path = require("path");

module.exports = {
  entry: "./public/javascripts/root.js",
  output: {
    filename: "bundle.js",
    path: path.join(
        __dirname, 
        "public",
        "javascripts"
    ),
  },
//   module: {
//     rules: [
//       {
//         test: /\.css$/i,
//         use: ["style-loader", "css-loader"],
//       },
//       {
//         test: /\.(png|jpg|jpeg|gif|webp)$/i,
//         type: "asset/resource",
//         generator: {
//           filename: 'images/[hash][ext][query]'
//         }
//       },
//     ],
//   },
    devtool: "source-map",
    mode: "development",
};
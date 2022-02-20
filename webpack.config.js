const path = require("path");

module.exports = {
  mode: 'development',
  entry: "./src/index.js",
  devtool: false,
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              "transform-observable",
              "transform-class-properties",
              "transform-jsx",
              "transform-jsx-conditional",
            ],
            presets: [
              [
                "@babel/env",
                {
                  targets: {
                    edge: "17",
                    firefox: "60",
                    chrome: "67",
                    safari: "11.1",
                    node: "current",
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
};


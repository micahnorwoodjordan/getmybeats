const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "../GetMyBeatsApp/static/js/bundle/"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".*", ".js", ".jsx"]
  },
  devServer: {
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.jpeg$/,
        exclude: /node_modules/,
        use: 'file-loader?name=/[name].[ext]&limit=30000'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env.PUBLIC_URL': JSON.stringify('http://localhost:8080/media')
    })
  ],
  optimization: {
    minimize: true
  },
};
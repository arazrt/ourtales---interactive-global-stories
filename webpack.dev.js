const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 9001,
    hot: true,
    liveReload: true,
    historyApiFallback: true,
    server: 'http',
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      webSocketURL: 'ws://localhost:9001/ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    watchFiles: ['src/**/*'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
        ],
      },
    ],
  },
});


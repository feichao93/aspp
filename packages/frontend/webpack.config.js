const webpack = require('webpack')
const path = require('path')
const getDevConfig = require('./devConfig')

function stringifyValues(obj) {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = JSON.stringify(value)
  }
  return result
}

module.exports = (env = {}) => ({
  entry: path.resolve(__dirname, 'src/main.tsx'),
  output: {
    publicPath: '/public',
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      WEBPACK_BUILD: JSON.stringify(true),
      ...stringifyValues(getDevConfig(Boolean(env.dev))),
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['react-hot-loader/babel'],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(styl|css)$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.ya?ml$/,
        use: ['json-loader', 'yaml-loader'],
      },
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader',
      },
    ],
  },
  devServer: {
    index: '',
    proxy: {
      '/': 'http://localhost:1477',
    },
    contentBase: __dirname,
    hot: true,
  },
})

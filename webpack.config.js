const webpack = require('webpack')
const path = require('path')

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    app: './index',
  },
  output: {
    path: __dirname + '/public/',
    filename: 'bundle.js',
    publicPath: './public/'
  },

  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      beautify: false,
      comments: false,
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'BABEL_ENV': JSON.stringify('production')
      }
    })
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: __dirname,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        include: path.join(__dirname, 'css'),
        loaders: ['style', 'css']
      },
    ]
  }
}

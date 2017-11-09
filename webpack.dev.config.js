const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const imageLoaderQuery = {
  mozjpeg: {
    progressive: true,
    quality: '55',
  },
  optipng: {
    optimizationLevel: 7,
  },
  pngquant: {
    quality: '55-80',
    speed: 10,
  },
};

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: ['webpack-hot-middleware/client?quiet=true', './index'],
  output: {
    path: __dirname + '/public/',
    filename: 'bundle.js',
    publicPath: './public/'
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/graphql-language-service-interface[\/\\]dist/, /\.js$/),
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(['public'], {
      root: path.resolve('./'),
      verbose: true,
      dry: false,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development'),
        'BABEL_ENV': JSON.stringify('development')
      }
    })
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: __dirname,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        include: path.join(__dirname, 'css'),
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=assets/img/[hash].[ext]',
          'image-webpack-loader?' + JSON.stringify(imageLoaderQuery),
        ],
      },
    ]
  }
};

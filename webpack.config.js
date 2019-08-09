const webpack = require('webpack');
const path = require('path');

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
  mode: process.env.NODE_ENV || 'production',
  entry: {
    app: './index',
  },
  output: {
    path: __dirname + '/public/',
    filename: 'bundle.js',
    publicPath: './public/'
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/graphql-language-service-interface[\/\\]dist/, /\.js$/),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: __dirname,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        include: path.join(__dirname),
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.css$/,
        include: /node_modules\/@entur\/component-library/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader?' + JSON.stringify(imageLoaderQuery),
        ],
      }
    ]
  }
};

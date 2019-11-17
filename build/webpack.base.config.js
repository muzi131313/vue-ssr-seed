const path = require('path')

const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const isProd = process.env.NODE_ENV === 'production'
const resolve = _path => path.resolve(__dirname, _path)

module.exports = {
  mode: isProd ? 'production' : 'development',
  output: {
    path: resolve('../dist'),
    publicPath: '/dist/',
    filename: isProd ? 'static/script/[name].[chunkhash].js' : 'static/script/[name].[hash].js'
  },
  resolve: {
    alias: {
      // 开发模式下为es6版本
      'vue$': isProd
        ? resolve('../node_modules/vue/dist/vue.min.js')
        : resolve('../node_modules/vue/dist/vue.runtime.esm.js'),
      '@': resolve('../src'),
      'public': resolve('../public')
    }
  },
  performance: {
    // 关闭提示
    hints: false
  },
  module: {
    noParse: /es6-promise\.js$/, // avoid webpack shimming process
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: isProd,
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader?cacheDirectory',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: isProd
    ? [
      new VueLoaderPlugin()
    ]
    : [
      new VueLoaderPlugin(),
      new FriendlyErrorsPlugin()
    ]
}

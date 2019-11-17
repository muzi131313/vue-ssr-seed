const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isProd = process.env.NODE_ENV === 'production'
const resolve = _path => path.resolve(__dirname, _path)

const config = merge(base, {
  entry: {
    app: './src/entry-client.js'
  },
  module: {
    rules: [
      {
        // 增加对 SCSS 文件的支持
        // 普通的 `.sass` 文件和 `*.vue` 文件中的
        test: /\.sass$/,
        // SCSS 文件的处理顺序为先 sass-loader 再 css-loader 再 style-loader
        use: [
          // 'thread-loader',
          {
            loader: isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            options: isProd
              ? {
                // CSS中导入的资源(例如图片)路径
                // 引入资源路径, 会相对css出现相对问题
                publicPath: '../../'
              }
              : {}
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                indentedSyntax: true,
                fiber: require('fibers')
              }
            }
          }
        ],
        include: resolve('../src'),
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    ...(
      isProd
        ? [
          new MiniCssExtractPlugin({
            filename: 'static/style/[name].[contenthash].css'
          })
        ]
        : []
    ),
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"'
    }),
    // `vue-ssr-client-manifest.json`
    new VueSSRClientPlugin()
  ]
})

module.exports = config

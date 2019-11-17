## 安装依赖
- 各种依赖
  ```
  npm i mini-css-extract-plugin vue-style-loader css-loader postcss-loader postcss-import postcss-preset-env cssnano sass-loader node-sass sass fibers -D
  ```
## 配置
- `webpack.client.config.js` 配置
  ```javascript
  module.exports = {
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
    }
  }
  ```
- `postcss.config.js`
  ```javascript
  module.exports = {
    parser: false,
    plugins: {
      'postcss-import': {},
      'postcss-preset-env': {},
      'cssnano': {}
    }
  }
  ```

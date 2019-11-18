## 日志
### 依赖安装
  ```
  npm i log4js -s
  ```
### 配置
  ```javascript
  const log4js = require('log4js');
  const appName = require('../../package.json').name;
  const path = require('path');
  const isProd = process.env.NODE_ENV === 'production';

  const appenders = {
    console: {
      type: 'console'
    },
    dateFile: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs')}/${appName}`,
      absolute: true,
      pattern: '_yyyy-MM-dd.log',
      maxLogSize: 50 * 1024,
      backup: 3,
      alwaysIncludePattern: true
    }
  };

  log4js.configure({
    appenders,
    categories: {
      default: {
        appenders: ['console', 'dateFile'],
        level: 'info'
      }
    },
    pm2: true,
    replaceConsole: true
  });

  const logger = log4js.getLogger(isProd ? 'dateFile' : 'console');

  module.exports = logger;
  ```
